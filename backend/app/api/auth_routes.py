import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from backend.app.db.session import get_db
from backend.app.db.models import User, UserToken, UserSavedQuery

auth_router = APIRouter(prefix="/auth", tags=["auth"])
users_router = APIRouter(prefix="/users", tags=["users"])

TOKEN_EXPIRE_DAYS = 30

# ── Schemas ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    institution: Optional[str] = None
    role: Optional[str] = "researcher"

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    institution: Optional[str] = None
    role: Optional[str] = None

class SaveQueryRequest(BaseModel):
    query_text: str
    intent: Optional[str] = None
    parameter: Optional[str] = None
    region: Optional[str] = None
    answer_snippet: Optional[str] = None

# ── Helpers ───────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False

def make_token() -> str:
    return secrets.token_urlsafe(32)

def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "bio": user.bio,
        "institution": user.institution,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_str = authorization.split(" ", 1)[1]
    result = await db.execute(select(UserToken).where(UserToken.token == token_str))
    token_obj = result.scalar_one_or_none()
    if not token_obj or token_obj.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    user = await db.get(User, token_obj.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Auth Endpoints ────────────────────────────────────────────────────────────

@auth_router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hash_password(req.password),
        institution=req.institution,
        role=req.role or "researcher",
        last_login=datetime.utcnow(),
    )
    db.add(user)
    await db.flush()

    token_str = make_token()
    token = UserToken(
        user_id=user.id,
        token=token_str,
        expires_at=datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS),
    )
    db.add(token)
    await db.commit()
    await db.refresh(user)

    return {"token": token_str, "user": user_to_dict(user)}


@auth_router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email.lower().strip()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.last_login = datetime.utcnow()

    token_str = make_token()
    token = UserToken(
        user_id=user.id,
        token=token_str,
        expires_at=datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS),
    )
    db.add(token)
    await db.commit()
    await db.refresh(user)

    return {"token": token_str, "user": user_to_dict(user)}


@auth_router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)


@auth_router.put("/profile")
async def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.name: current_user.name = req.name
    if req.bio is not None: current_user.bio = req.bio
    if req.institution is not None: current_user.institution = req.institution
    if req.role: current_user.role = req.role
    await db.commit()
    await db.refresh(current_user)
    return user_to_dict(current_user)


@auth_router.post("/logout")
async def logout(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.split(" ", 1)[1]
        result = await db.execute(select(UserToken).where(UserToken.token == token_str))
        token_obj = result.scalar_one_or_none()
        if token_obj:
            await db.delete(token_obj)
            await db.commit()
    return {"status": "logged out"}


# ── User Query Endpoints ──────────────────────────────────────────────────────

@users_router.get("/me/queries")
async def get_my_queries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserSavedQuery)
        .where(UserSavedQuery.user_id == current_user.id)
        .order_by(UserSavedQuery.created_at.desc())
        .limit(50)
    )
    queries = result.scalars().all()
    return [
        {
            "id": q.id,
            "query_text": q.query_text,
            "intent": q.intent,
            "parameter": q.parameter,
            "region": q.region,
            "answer_snippet": q.answer_snippet,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
        for q in queries
    ]


@users_router.post("/me/queries")
async def save_my_query(
    req: SaveQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    q = UserSavedQuery(
        user_id=current_user.id,
        query_text=req.query_text,
        intent=req.intent,
        parameter=req.parameter,
        region=req.region,
        answer_snippet=req.answer_snippet[:300] if req.answer_snippet else None,
    )
    db.add(q)
    await db.commit()
    return {"status": "saved", "id": q.id}


@users_router.delete("/me/queries/{query_id}")
async def delete_my_query(
    query_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserSavedQuery).where(
            UserSavedQuery.id == query_id,
            UserSavedQuery.user_id == current_user.id
        )
    )
    q = result.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")
    await db.delete(q)
    await db.commit()
    return {"status": "deleted"}


@users_router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserSavedQuery).where(UserSavedQuery.user_id == current_user.id)
    )
    queries = result.scalars().all()
    params = [q.parameter for q in queries if q.parameter]
    regions = [q.region for q in queries if q.region]
    return {
        "total_queries": len(queries),
        "top_parameter": max(set(params), key=params.count) if params else None,
        "top_region": max(set(regions), key=regions.count) if regions else None,
        "member_since": current_user.created_at.strftime("%B %Y") if current_user.created_at else "Unknown",
    }
