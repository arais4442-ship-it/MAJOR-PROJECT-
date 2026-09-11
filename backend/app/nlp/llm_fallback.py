import os
import httpx
from typing import Dict, Any, Optional, List
from backend.app.config import settings

class LLMEngine:
    def __init__(self):
        self.ollama_base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.ollama_model = settings.OLLAMA_MODEL
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.provider = settings.LLM_PROVIDER.lower()

    async def get_ollama_models(self) -> List[str]:
        """
        Fetch installed models from local Ollama instance.
        """
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.ollama_base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", []) if m.get("name")]
                    return models
        except Exception:
            pass
        return []

    async def _query_ollama(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Send prompt to local Ollama instance.
        """
        try:
            # Auto-detect installed model if configured model is not specified or we can find one
            models = await self.get_ollama_models()
            model_to_use = self.ollama_model
            if models and (model_to_use not in models and f"{model_to_use}:latest" not in models):
                model_to_use = models[0]  # Use first installed model

            payload = {
                "model": model_to_use,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9,
                }
            }
            if system_prompt:
                payload["system"] = system_prompt

            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(f"{self.ollama_base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "").strip()
        except Exception as e:
            print(f"[Ollama Error] {e}")
            return None
        return None

    async def _query_gemini(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Send prompt to Google Gemini API as fallback or primary if configured.
        """
        if not self.gemini_api_key or self.gemini_api_key == "your_gemini_api_key_here":
            return None

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_api_key)
            # Try newer available models gracefully
            for model_name in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro"]:
                try:
                    model = genai.GenerativeModel(model_name)
                    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                    response = await model.generate_content_async(full_prompt)
                    if response and response.text:
                        return response.text.strip()
                except Exception:
                    continue
        except Exception as e:
            print(f"[Gemini Error] {e}")
            return None
        return None

    async def fallback_interpret(self, query: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Interpret ambiguous / low-confidence query using local Ollama or Gemini.
        """
        prompt = (
            f"You are OceanIQ, an ARGO ocean data specialist. Interpret this query for ocean parameters: '{query}'. "
            f"Provide a clear 2-sentence summary of what ocean data to query (such as region, depth, parameter, trend)."
        )

        response = await self._query_ollama(prompt)
        if response:
            return {
                "interpretation": response,
                "confidence_boost": 0.30,
                "llm_used": True,
                "provider": "ollama"
            }

        response = await self._query_gemini(prompt)
        if response:
            return {
                "interpretation": response,
                "confidence_boost": 0.30,
                "llm_used": True,
                "provider": "gemini"
            }

        return {
            "interpretation": f"Low confidence query interpreted using oceanography rule heuristics: '{query}'",
            "confidence_boost": 0.15,
            "llm_used": False,
            "provider": "none"
        }

    async def chat(self, query: str, context: Optional[str] = None, provider_preference: Optional[str] = None) -> str:
        """
        Direct conversational and predictive chat endpoint with oceanographic intelligence.
        """
        system_instruction = (
            "You are OceanIQ AI, an advanced oceanographic intelligence assistant specialized in ARGO float telemetry, "
            "marine sciences, ocean parameters (temperature, salinity, pressure, dissolved oxygen, chlorophyll), "
            "climate trends, ocean forecasts, and anomaly detection.\n\n"
            "Guidelines:\n"
            "- Answer every question in exactly 5 numbered points (1. through 5.); never write a paragraph-only answer and never exceed 10 points.\n"
            "- Keep each point concise, scientifically accurate, and directly relevant to the user's ocean question.\n"
            "- When asked about future predictions, multi-year forecasts, or drawbacks/challenges (e.g. data sparsity, sensor drift, "
            "El Niño/IOD variability, climate modeling uncertainty, non-linear atmospheric coupling), provide a clear, realistic scientific breakdown.\n"
            "- Use clean markdown formatting with numbered points and bold labels.\n"
            "- Incorporate any provided telemetry metrics naturally into the answer if relevant."
        )

        prompt = f"User Query: {query}\n\nOcean Telemetry / Database Context:\n{context if context else 'No live telemetry retrieved.'}"

        target_provider = (provider_preference or self.provider).lower()

        # 1. Try Ollama if requested or default
        if target_provider in ["ollama", "local", "auto"]:
            ollama_resp = await self._query_ollama(prompt, system_instruction)
            if ollama_resp:
                return ollama_resp

        # 2. Try Gemini fallback if Ollama failed or Gemini was chosen
        if target_provider in ["gemini", "cloud", "auto"] or target_provider == "ollama":
            gemini_resp = await self._query_gemini(prompt, system_instruction)
            if gemini_resp:
                return gemini_resp

        # 3. If neither worked, provide clear local diagnostics
        return (
            f"**OceanIQ Telemetry Analysis — {query}**\n\n"
            f"1. **Query assessment:** Processing the ocean question with rule-based heuristics.\n"
            f"2. **Telemetry context:** {context if context else 'ARGO profile database parameters evaluated.'}\n"
            f"3. **Data mode:** No live generative response was available.\n"
            f"4. **Local AI:** Ollama should be running at `http://127.0.0.1:11434`.\n"
            f"5. **Model:** Start a model with `ollama run llama3` and retry the question."
        )

llm_fallback = LLMEngine()
