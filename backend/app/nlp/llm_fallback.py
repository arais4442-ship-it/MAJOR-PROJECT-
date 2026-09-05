import os
from typing import Dict, Any, Optional
from backend.app.config import settings

class LLMFallbackEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def fallback_interpret(self, query: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Optional Gemini API fallback for interpreting low-confidence queries.
        If no API key is set, returns a structured fallback response gracefully.
        """
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            return {
                "interpretation": f"Low confidence query interpreted using default oceanography rule heuristics: '{query}'",
                "confidence_boost": 0.15,
                "llm_used": False
            }
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = f"You are OceanIQ, an ARGO ocean data specialist. Interpret this query for ocean parameters: '{query}'. Provide a clear 2-sentence summary of what ocean data to query."
            response = await model.generate_content_async(prompt)
            return {
                "interpretation": response.text.strip(),
                "confidence_boost": 0.30,
                "llm_used": True
            }
        except Exception as e:
            return {
                "interpretation": f"Fallback error: {str(e)}. Defaulting to rule-based retrieval.",
                "confidence_boost": 0.0,
                "llm_used": False
            }

    async def chat(self, query: str, context: Optional[str] = None) -> str:
        """
        Direct conversational chat endpoint using Gemini.
        """
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            return (
                f"**OceanIQ Standard Retrieval Console**\n\n"
                f"I processed your query: '{query}'. To activate full, flexible generative AI conversational "
                f"responses, please ensure a valid `GEMINI_API_KEY` is configured in the `.env` file."
            )

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            system_instruction = (
                "You are OceanIQ, a Cybertronian-themed ARGO ocean telemetry assistant (Core V2.5). "
                "Answer the user's question with high intelligence, scientific accuracy, and a sleek, engaging tone. "
                "Provide bullet points or a brief paragraph (max 4 sentences total) keeping explanations punchy, structured, and easy to read. "
                "Use markdown formatting with bolding for terms. "
                "If they are asking conversational greetings, respond warmly. "
                "If they are asking a science, instrumentation, or oceanography question, answer directly. "
                "If database metrics context is provided, incorporate it naturally as real telemetry metrics."
            )
            
            prompt = f"{system_instruction}\n\nUser Query: {query}\n\nTelemetry Context: {context if context else 'No live telemetry retrieved.'}"
            response = await model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Core neural matrix failure: {str(e)}. Please try again."

llm_fallback = LLMFallbackEngine()

