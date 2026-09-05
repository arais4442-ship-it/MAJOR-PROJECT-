from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.session import Base

class ArgoFloat(Base):
    __tablename__ = "argo_floats"

    id = Column(Integer, primary_key=True, index=True)
    wmo_id = Column(String, unique=True, index=True, nullable=False)
    platform_type = Column(String, nullable=True)
    pi_name = Column(String, nullable=True)
    data_center = Column(String, nullable=True)
    source = Column(String, default='CACHED')           # 'LIVE_GDAC' or 'CACHED'
    last_seen_at = Column(DateTime, nullable=True)      # When this float last transmitted
    created_at = Column(DateTime, default=datetime.utcnow)

    profiles = relationship("ArgoProfile", back_populates="float_obj")

class ArgoProfile(Base):
    __tablename__ = "argo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    wmo_id = Column(String, ForeignKey("argo_floats.wmo_id"), index=True, nullable=False)
    cycle_number = Column(Integer, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    latitude = Column(Float, index=True, nullable=False)
    longitude = Column(Float, index=True, nullable=False)
    location_name = Column(String, index=True, nullable=True)
    data_mode = Column(String, nullable=True)  # R: Realtime, D: Delayed
    direction = Column(String, default="A")
    data_source = Column(String, default='CACHED')      # 'LIVE_GDAC' or 'CACHED'

    float_obj = relationship("ArgoFloat", back_populates="profiles")
    measurements = relationship("ArgoMeasurement", back_populates="profile", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_lat_lon_date', 'latitude', 'longitude', 'date'),
    )

class ArgoMeasurement(Base):
    __tablename__ = "argo_measurements"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("argo_profiles.id"), index=True, nullable=False)
    pressure = Column(Float, nullable=False)        # dbar (~depth)
    pressure_qc = Column(Integer, default=1)
    temperature = Column(Float, nullable=True)      # °C
    temperature_qc = Column(Integer, default=1)
    salinity = Column(Float, nullable=True)         # PSU
    salinity_qc = Column(Integer, default=1)
    dissolved_oxygen = Column(Float, nullable=True) # µmol/kg (BGC)
    chlorophyll = Column(Float, nullable=True)      # mg/m³ (BGC)

    profile = relationship("ArgoProfile", back_populates="measurements")

class QueryFeedback(Base):
    __tablename__ = "query_feedback"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    classified_intent = Column(String, nullable=False)
    extracted_slots = Column(Text, nullable=True)
    user_rating = Column(Integer, nullable=True)
    user_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    institution = Column(String, nullable=True)
    role = Column(String, default="researcher")   # researcher / student / admin
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    tokens = relationship("UserToken", back_populates="user", cascade="all, delete-orphan")
    saved_queries = relationship("UserSavedQuery", back_populates="user", cascade="all, delete-orphan")


class UserToken(Base):
    __tablename__ = "user_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tokens")


class UserSavedQuery(Base):
    __tablename__ = "user_saved_queries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    query_text = Column(Text, nullable=False)
    intent = Column(String, nullable=True)
    parameter = Column(String, nullable=True)
    region = Column(String, nullable=True)
    answer_snippet = Column(Text, nullable=True)   # first 300 chars of response
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_queries")
