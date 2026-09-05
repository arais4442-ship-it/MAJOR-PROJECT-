from typing import List, Dict, Any

class ConfidenceEvaluator:
    def compute_confidence(
        self,
        profile_count: int,
        intent_confidence: float,
        qc_pass_ratio: float = 1.0,
        data_recency_days: int = 30
    ) -> Dict[str, Any]:
        """
        Computes composite confidence score based on profile count, QC flag ratio, and intent router confidence.
        """
        # Profile density score
        density_score = min(1.0, profile_count / 15.0)

        # Composite score
        composite = (0.4 * intent_confidence) + (0.4 * density_score) + (0.2 * qc_pass_ratio)
        composite = round(min(0.98, max(0.50, composite)), 2)

        quality_rating = "High" if composite >= 0.85 else ("Medium" if composite >= 0.70 else "Low")

        return {
            "score": composite,
            "quality_rating": quality_rating,
            "profile_count": profile_count,
            "qc_pass_ratio": f"{int(qc_pass_ratio * 100)}%",
            "density_level": "Optimal" if profile_count >= 10 else "Sparse"
        }

confidence_evaluator = ConfidenceEvaluator()
