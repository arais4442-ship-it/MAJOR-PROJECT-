import re
from typing import Dict, Any, Optional
from datetime import datetime

# Parameter aliases map
PARAM_ALIASES = {
    "temperature": ["temp", "temperature", "sst", "warmth", "heat", "thermal"],
    "salinity": ["salinity", "sal", "salt", "psu", "haline"],
    "pressure": ["pressure", "depth", "dbar"],
    "dissolved_oxygen": ["oxygen", "do", "dissolved oxygen", "o2"],
    "chlorophyll": ["chlorophyll", "chla", "chlorophyll-a", "bgc"]
}

REGION_BOUNDS = {
    "arabian sea": {"min_lat": 8.0, "max_lat": 25.0, "min_lon": 50.0, "max_lon": 77.0},
    "bay of bengal": {"min_lat": 5.0, "max_lat": 22.0, "min_lon": 80.0, "max_lon": 98.0},
    "laccadive sea": {"min_lat": 7.0, "max_lat": 14.0, "min_lon": 71.0, "max_lon": 78.0},
    "equatorial indian ocean": {"min_lat": -5.0, "max_lat": 5.0, "min_lon": 60.0, "max_lon": 95.0},
    "indian ocean": {"min_lat": -10.0, "max_lat": 30.0, "min_lon": 45.0, "max_lon": 105.0}
}

class EntityExtractor:
    def extract_entities(self, query: str) -> Dict[str, Any]:
        query_lower = query.lower()

        # 1. Parameter extraction
        extracted_param = "temperature"  # Default
        for param, aliases in PARAM_ALIASES.items():
            if any(alias in query_lower for alias in aliases):
                extracted_param = param
                break

        # 2. Region extraction
        extracted_region = None
        bounds = None
        for region, bbox in REGION_BOUNDS.items():
            if region in query_lower:
                extracted_region = region.title()
                bounds = bbox
                break
        
        if not bounds:
            # Default to Arabian Sea if omitted
            extracted_region = "Arabian Sea"
            bounds = REGION_BOUNDS["arabian sea"]

        # 3. Time extraction
        year_match = re.search(r'\b(202[0-4]|201[0-9])\b', query_lower)
        start_date = None
        end_date = None

        if year_match:
            year = int(year_match.group(1))
            if "monsoon" in query_lower:
                start_date = f"{year}-06-01"
                end_date = f"{year}-09-30"
            elif "winter" in query_lower:
                start_date = f"{year}-12-01"
                end_date = f"{year+1}-02-28"
            elif "summer" in query_lower:
                start_date = f"{year}-03-01"
                end_date = f"{year}-05-31"
            else:
                start_date = f"{year}-01-01"
                end_date = f"{year}-12-31"
        else:
            # Default to recent 2023-2024 range
            start_date = "2023-01-01"
            end_date = "2024-12-31"

        # 4. Depth extraction
        depth_match = re.search(r'(?:depth|surface|deep|\b(\d+)\s*m\b)', query_lower)
        max_depth = 1000.0
        min_depth = 0.0
        if "surface" in query_lower:
            max_depth = 50.0
        elif "deep" in query_lower:
            min_depth = 200.0
        elif depth_match and depth_match.group(1):
            max_depth = float(depth_match.group(1))

        return {
            "parameter": extracted_param,
            "region": extracted_region,
            "bounds": bounds,
            "start_date": start_date,
            "end_date": end_date,
            "min_depth": min_depth,
            "max_depth": max_depth
        }

ner_extractor = EntityExtractor()
