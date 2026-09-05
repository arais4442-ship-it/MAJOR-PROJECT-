import asyncio
import logging
from datetime import datetime
from typing import Optional

from backend.app.live import argo_live_fetcher

logger = logging.getLogger(__name__)


class SyncScheduler:
    def __init__(self):
        self.last_sync_at: Optional[datetime] = None
        self.records_synced: int = 0
        self.is_running: bool = False
        self.source: str = "CACHED"
        self._task: Optional[asyncio.Task] = None
        self.sync_interval_hours: int = 6

    def get_status(self) -> dict:
        now = datetime.utcnow()
        mins_ago = None
        next_sync_in = None
        if self.last_sync_at:
            delta = (now - self.last_sync_at).total_seconds()
            mins_ago = int(delta / 60)
            next_sync_secs = max(0, self.sync_interval_hours * 3600 - delta)
            next_sync_in = int(next_sync_secs / 60)

        return {
            "is_live": self.source == "LIVE_GDAC",
            "is_running": self.is_running,
            "last_sync": mins_ago,
            "last_sync_at": self.last_sync_at.isoformat() if self.last_sync_at else None,
            "next_sync_in_minutes": next_sync_in,
            "records_synced": self.records_synced,
            "source": self.source,
            "activeFloats": 5,
            "totalProfiles": "Live",
        }

    async def sync_now(self) -> int:
        """Fetch live data and upsert into DB. Returns number of new records."""
        from backend.app.db.session import AsyncSessionLocal
        from backend.app.db.models import ArgoFloat, ArgoProfile, ArgoMeasurement
        from sqlalchemy import select

        logger.info("Starting ARGO live sync...")
        new_records = 0

        try:
            profiles = await argo_live_fetcher.fetch_profiles(days_back=30)

            if not profiles:
                logger.info("No live profiles fetched — keeping cached data")
                self.last_sync_at = datetime.utcnow()
                self.source = "CACHED"
                return 0

            async with AsyncSessionLocal() as session:
                for p in profiles:
                    # Upsert float
                    existing_float = await session.get(ArgoFloat, p['wmo_id'])
                    if not existing_float:
                        session.add(ArgoFloat(
                            wmo_id=p['wmo_id'],
                            platform_type="ARGO",
                            pi_name="GDAC",
                            data_center="GDAC",
                            source="LIVE_GDAC",
                            last_seen_at=p.get('date') if isinstance(p.get('date'), datetime) else datetime.utcnow()
                        ))
                    else:
                        existing_float.source = "LIVE_GDAC"
                        existing_float.last_seen_at = datetime.utcnow()

                    # Check if profile exists
                    stmt = select(ArgoProfile).where(
                        ArgoProfile.wmo_id == p['wmo_id'],
                        ArgoProfile.cycle_number == p['cycle_number']
                    )
                    result = await session.execute(stmt)
                    existing_profile = result.scalar_one_or_none()

                    if not existing_profile:
                        date_val = p['date'] if isinstance(p['date'], datetime) else datetime.utcnow()
                        profile_obj = ArgoProfile(
                            wmo_id=p['wmo_id'],
                            cycle_number=p['cycle_number'],
                            date=date_val,
                            latitude=p['latitude'],
                            longitude=p['longitude'],
                            location_name=p.get('location_name', 'Indian Ocean'),
                            data_mode='R',
                            direction='A',
                            data_source='LIVE_GDAC'
                        )
                        session.add(profile_obj)
                        await session.flush()

                        for m in p.get('measurements', []):
                            session.add(ArgoMeasurement(
                                profile_id=profile_obj.id,
                                pressure=m.get('pressure', 0),
                                pressure_qc=m.get('pressure_qc', 1),
                                temperature=m.get('temperature'),
                                temperature_qc=m.get('temperature_qc', 1),
                                salinity=m.get('salinity'),
                                salinity_qc=m.get('salinity_qc', 1),
                                dissolved_oxygen=m.get('dissolved_oxygen'),
                                chlorophyll=m.get('chlorophyll'),
                            ))
                        new_records += 1

                await session.commit()

            self.records_synced = new_records
            self.source = "LIVE_GDAC"
            logger.info(f"Sync complete: {new_records} new profiles from LIVE_GDAC")

        except Exception as e:
            logger.error(f"Sync error: {e}")
            self.source = "CACHED"

        finally:
            self.last_sync_at = datetime.utcnow()

        return new_records

    async def _run_loop(self):
        """Background loop that syncs every N hours."""
        self.is_running = True
        try:
            # Initial sync on startup
            await asyncio.sleep(5)  # Let server finish starting
            await self.sync_now()

            while True:
                await asyncio.sleep(self.sync_interval_hours * 3600)
                await self.sync_now()
        except asyncio.CancelledError:
            logger.info("Sync scheduler stopped")
        finally:
            self.is_running = False

    def start(self):
        """Start the background sync loop."""
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._run_loop())
            logger.info(f"Sync scheduler started (every {self.sync_interval_hours}h)")

    def stop(self):
        """Stop the background sync loop."""
        if self._task and not self._task.done():
            self._task.cancel()
            logger.info("Sync scheduler stopping...")


sync_scheduler = SyncScheduler()
