from typing import Dict, Any, Optional

LOCATION_METADATA = {
    "arabian sea": {"region": "Arabian Sea", "lat_center": 15.0, "lon_center": 65.0, "min_lat": 8.0, "max_lat": 25.0, "min_lon": 50.0, "max_lon": 77.0},
    "bay of bengal": {"region": "Bay of Bengal", "lat_center": 14.0, "lon_center": 88.0, "min_lat": 5.0, "max_lat": 22.0, "min_lon": 80.0, "max_lon": 98.0},
    "laccadive sea": {"region": "Laccadive Sea", "lat_center": 10.0, "lon_center": 74.0, "min_lat": 7.0, "max_lat": 14.0, "min_lon": 71.0, "max_lon": 78.0},
    "equatorial indian ocean": {"region": "Equatorial Indian Ocean", "lat_center": 0.0, "lon_center": 80.0, "min_lat": -5.0, "max_lat": 5.0, "min_lon": 60.0, "max_lon": 95.0}
}

class SemanticMetadataStore:
    """
    Fuzzy location matching helper store for mapping ambiguous location terms to PostGIS bounding boxes.
    """
    def resolve_location(self, text: str) -> Optional[Dict[str, Any]]:
        text_lower = text.lower()
        for loc, meta in LOCATION_METADATA.items():
            if loc in text_lower:
                return meta
        return None

metadata_store = SemanticMetadataStore()
