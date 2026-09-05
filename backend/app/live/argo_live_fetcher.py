import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

async def fetch_profiles(days_back: int = 30) -> List[Dict[str, Any]]:
    """Fetch real ARGO profiles from GDAC via argopy. Falls back to empty list on any error."""
    try:
        import argopy
        from argopy import DataFetcher as ArgoDataFetcher
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)
        
        date_start = start_date.strftime("%Y-%m-%d")
        date_end = end_date.strftime("%Y-%m-%d")
        
        logger.info(f"Fetching ARGO profiles from {date_start} to {date_end} for Indian Ocean region...")
        
        # Indian Ocean region: lon 40-120, lat -30 to 30, pressure 0-1000
        loader = ArgoDataFetcher(src='erddap', progress=False).region([
            40, 120, -30, 30, 0, 1000, date_start, date_end
        ])
        
        # Run in executor to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        ds = await asyncio.wait_for(
            loop.run_in_executor(None, loader.to_xarray),
            timeout=60.0
        )
        
        df = ds.to_dataframe().reset_index()
        profiles = []
        
        # Group by float + cycle
        if 'PLATFORM_NUMBER' in df.columns and 'CYCLE_NUMBER' in df.columns:
            grouped = df.groupby(['PLATFORM_NUMBER', 'CYCLE_NUMBER'])
            for (wmo_id, cycle), group in grouped:
                first_row = group.iloc[0]
                profile = {
                    'wmo_id': str(wmo_id).strip(),
                    'cycle_number': int(cycle),
                    'date': first_row.get('TIME', datetime.utcnow()),
                    'latitude': float(first_row.get('LATITUDE', 0)),
                    'longitude': float(first_row.get('LONGITUDE', 0)),
                    'location_name': _get_region_name(
                        float(first_row.get('LATITUDE', 0)),
                        float(first_row.get('LONGITUDE', 0))
                    ),
                    'data_mode': 'R',
                    'data_source': 'LIVE_GDAC',
                    'measurements': []
                }
                
                for _, row in group.iterrows():
                    meas = {
                        'pressure': float(row.get('PRES', 0) or 0),
                        'pressure_qc': int(row.get('PRES_QC', 1) or 1),
                        'temperature': float(row['TEMP']) if 'TEMP' in row and row['TEMP'] is not None else None,
                        'temperature_qc': int(row.get('TEMP_QC', 1) or 1),
                        'salinity': float(row['PSAL']) if 'PSAL' in row and row['PSAL'] is not None else None,
                        'salinity_qc': int(row.get('PSAL_QC', 1) or 1),
                        'dissolved_oxygen': float(row['DOXY']) if 'DOXY' in df.columns and 'DOXY' in row and row['DOXY'] is not None else None,
                        'chlorophyll': float(row['CHLA']) if 'CHLA' in df.columns and 'CHLA' in row and row['CHLA'] is not None else None,
                    }
                    profile['measurements'].append(meas)
                
                if profile['measurements']:
                    profiles.append(profile)
        
        logger.info(f"Fetched {len(profiles)} real ARGO profiles from GDAC")
        return profiles
        
    except asyncio.TimeoutError:
        logger.warning("ARGO GDAC fetch timed out after 60s — using cached data")
        return []
    except ImportError:
        logger.warning("argopy not installed — using cached data")
        return []
    except Exception as e:
        logger.warning(f"ARGO live fetch failed: {e} — using cached data")
        return []


async def fetch_float_positions() -> List[Dict[str, Any]]:
    """Returns last known position of each float in the Indian Ocean."""
    try:
        import argopy
        from argopy import DataFetcher as ArgoDataFetcher
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        loader = ArgoDataFetcher(src='erddap', progress=False).region([
            40, 120, -30, 30, 0, 10,
            start_date.strftime("%Y-%m-%d"),
            end_date.strftime("%Y-%m-%d")
        ])
        
        loop = asyncio.get_event_loop()
        ds = await asyncio.wait_for(
            loop.run_in_executor(None, loader.to_xarray),
            timeout=45.0
        )
        
        df = ds.to_dataframe().reset_index()
        positions = []
        
        if 'PLATFORM_NUMBER' in df.columns:
            latest = df.sort_values('TIME', ascending=False).groupby('PLATFORM_NUMBER').first().reset_index()
            for _, row in latest.iterrows():
                positions.append({
                    'wmo_id': str(row['PLATFORM_NUMBER']).strip(),
                    'lat': float(row.get('LATITUDE', 0)),
                    'lon': float(row.get('LONGITUDE', 0)),
                    'last_seen': str(row.get('TIME', datetime.utcnow()))[:10],
                    'region': _get_region_name(float(row.get('LATITUDE', 0)), float(row.get('LONGITUDE', 0))),
                    'data_source': 'LIVE_GDAC',
                    'is_active': True
                })
        
        return positions
    except Exception as e:
        logger.warning(f"Float position fetch failed: {e}")
        return []


def _get_region_name(lat: float, lon: float) -> str:
    """Map coordinates to ocean region name."""
    if 8 <= lat <= 25 and 50 <= lon <= 77:
        return "Arabian Sea"
    elif 5 <= lat <= 22 and 80 <= lon <= 98:
        return "Bay of Bengal"
    elif 7 <= lat <= 14 and 71 <= lon <= 78:
        return "Laccadive Sea"
    elif -5 <= lat <= 5 and 60 <= lon <= 95:
        return "Equatorial Indian Ocean"
    elif 12 <= lat <= 30 and 32 <= lon <= 45:
        return "Red Sea"
    else:
        return "Indian Ocean"
