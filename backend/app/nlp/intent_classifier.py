from typing import Dict, Any, Tuple

INTENT_KEYWORDS = {
    "forecast": ["predict", "forecast", "future", "next month", "upcoming", "trend prediction", "estimate"],
    "comparison": ["compare", "versus", "vs", "difference", "between", "higher", "lower", "contrast"],
    "trend": ["trend", "change over time", "temporal", "variation", "anomaly", "series", "history", "show me"],
    "point_lookup": ["profile", "depth profile", "location of float", "wmo", "single", "value at depth", "float id"]
}

class IntentClassifier:
    def classify(self, query: str) -> Tuple[str, float]:
        query_lower = query.lower()
        
        scores: Dict[str, float] = {
            "forecast": 0.0,
            "comparison": 0.0,
            "trend": 0.0,
            "point_lookup": 0.0
        }

        for intent, keywords in INTENT_KEYWORDS.items():
            for kw in keywords:
                if kw in query_lower:
                    scores[intent] += 1.0

        max_intent = max(scores, key=scores.get)
        max_score = scores[max_intent]

        if max_score == 0.0:
            # Default to 'trend' with medium confidence for open-ended queries
            return "trend", 0.70
        
        # Normalize confidence score
        confidence = min(0.95, 0.70 + (max_score * 0.12))
        return max_intent, confidence

intent_classifier = IntentClassifier()
