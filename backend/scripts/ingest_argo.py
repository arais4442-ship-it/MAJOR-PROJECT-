import os
import sys
import asyncio
import random
from datetime import datetime, timedelta
import numpy as np

# Ensure backend root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.db.session import engine, Base, AsyncSessionLocal
from backend.app.db.models import ArgoFloat, ArgoProfile, ArgoMeasurement

INDIAN_OCEAN_FLOATS = [
    {"wmo_id": "2902745", "pi_name": "INCOIS", "data_center": "INCOIS", "lat_center": 15.5, "lon_center": 68.2, "region": "Arabian Sea"},
    {"wmo_id": "2902746", "pi_name": "INCOIS", "data_center": "INCOIS", "lat_center": 12.1, "lon_center": 88.5, "region": "Bay of Bengal"},
    {"wmo_id": "2903120", "pi_name": "NIO", "data_center": "INCOIS", "lat_center": 8.4, "lon_center": 75.1, "region": "Laccadive Sea"},
    {"wmo_id": "5906231", "pi_name": "CSIRO", "data_center": "CSIRO", "lat_center": 5.2, "lon_center": 90.1, "region": "Equatorial Indian Ocean"},
    {"wmo_id": "5906232", "pi_name": "INCOIS", "data_center": "INCOIS", "lat_center": 18.2, "lon_center": 71.4, "region": "Northern Arabian Sea"},
]

def generate_depth_profile(max_depth=1000):
    pressures = [0, 10, 20, 50, 100, 200, 300, 500, 750, 1000]
    surface_temp = random.uniform(27.0, 30.5)  # Warm tropical SST
    deep_temp = 4.2
    
    surface_sal = random.uniform(34.5, 36.2)
    deep_sal = 34.8

    measurements = []
    for p in pressures:
        # Exponential thermocline decay
        temp = deep_temp + (surface_temp - deep_temp) * np.exp(-p / 250.0) + random.uniform(-0.1, 0.1)
        sal = surface_sal + (deep_sal - surface_sal) * (1 - np.exp(-p / 400.0)) + random.uniform(-0.05, 0.05)
        do = max(10, 210 - 150 * np.exp(-((p - 150) / 100)**2))  # Oxygen minimum zone around 150m
        chl = max(0, 1.2 * np.exp(-((p - 40) / 25)**2)) if p <= 150 else 0.0  # Chlorophyll maximum near 40m

        measurements.append({
            "pressure": float(p),
            "pressure_qc": 1,
            "temperature": round(float(temp), 3),
            "temperature_qc": 1,
            "salinity": round(float(sal), 3),
            "salinity_qc": 1,
            "dissolved_oxygen": round(float(do), 2),
            "chlorophyll": round(float(chl), 3)
        })
    return measurements

async def seed_database():
    print("Initializing Database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        # Create Float records
        from sqlalchemy import select
        for f_data in INDIAN_OCEAN_FLOATS:
            stmt = select(ArgoFloat).where(ArgoFloat.wmo_id == f_data["wmo_id"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                argo_float = ArgoFloat(
                    wmo_id=f_data["wmo_id"],
                    pi_name=f_data["pi_name"],
                    data_center=f_data["data_center"],
                    platform_type="SOLO_II"
                )
                session.add(argo_float)
        await session.commit()

        # Create Profile & Measurement records for past 2 years
        start_date = datetime(2023, 1, 1)
        cycle = 1
        
        for day in range(0, 500, 10):  # 10-day cycle per profile
            profile_date = start_date + timedelta(days=day)
            for f_data in INDIAN_OCEAN_FLOATS:
                # Add float drift trajectory
                lat = f_data["lat_center"] + np.sin(day / 30.0) * 0.5 + random.uniform(-0.1, 0.1)
                lon = f_data["lon_center"] + np.cos(day / 30.0) * 0.5 + random.uniform(-0.1, 0.1)
                
                profile = ArgoProfile(
                    wmo_id=f_data["wmo_id"],
                    cycle_number=cycle,
                    date=profile_date,
                    latitude=round(float(lat), 4),
                    longitude=round(float(lon), 4),
                    location_name=f_data["region"],
                    data_mode="D",
                    direction="A"
                )
                session.add(profile)
                await session.flush()  # get profile.id

                m_list = generate_depth_profile()
                for m in m_list:
                    meas = ArgoMeasurement(
                        profile_id=profile.id,
                        **m
                    )
                    session.add(meas)
            cycle += 1

        await session.commit()
        print("Database successfully seeded with ARGO profile data!")

if __name__ == "__main__":
    asyncio.run(seed_database())
