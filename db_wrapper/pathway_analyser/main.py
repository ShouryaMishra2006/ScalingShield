import os
import json
import cohere
from fastapi import FastAPI, Request
from dotenv import load_dotenv
import uvicorn
import logging

# Load environment variables
load_dotenv()

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sql-analyzer")

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
MODEL_NAME = os.getenv("COHERE_MODEL", "command-r-05-2025") # Updated model default
PORT = int(os.getenv("PORT", 8123))

app = FastAPI(title="SQL Query Analyzer", version="1.0")

# Initialize Cohere client
if COHERE_API_KEY:
    co = cohere.Client(api_key=COHERE_API_KEY)
else:
    co = None
    logger.warning("COHERE_API_KEY not found, running in MOCK mode.")

@app.post("/v1/analyze")
async def analyze(req: Request):
    data = await req.json()
    user_id = data.get("user_id", "unknown")
    query = data.get("query", "")
    category = data.get("category", "")
    reason = data.get("reason", "")

    logger.info(f"Incoming request user_id={user_id}, query={query}")

    # Mock fallback if no API key
    if not co:
        decision = "malicious" if any(word in query.lower() for word in ["drop", "delete", "truncate"]) else "safe"
        return {
            "analysis": {
                "decision": decision,
                "confidence": 0.95,
                "explanation": "Mock mode: keyword-based heuristic."
            }
        }

    # --- FIX ---
    # The 'messages' argument is for v5+ of the cohere SDK.
    # The error indicates an older version (e.g., v4) is installed,
    # which expects 'message' (singular) and 'preamble'.
    
    system_prompt = "You are an SQL intrusion detection assistant you act as firewall based on the user system logs behaviour and query behaviour you need to judge if the system is compromised."
    user_prompt = f"""
SQL Query: {query}
User ID: {user_id}
Category: {category}
Reason: {reason}

Decide in JSON:
{{
    "decision": "safe" | "risky" | "malicious",
    "confidence": 0.0-1.0,
    "explanation": "why"
}}
"""

    try:
        # Use 'message' and 'preamble' arguments for older SDK versions
        response = co.chat(
            model=MODEL_NAME,
            message=user_prompt,
            preamble=system_prompt,
            max_tokens=250,
            temperature=0.0
        )
        # In older SDKs, the response text is in the '.text' attribute
        generated = response.text
    except Exception as e:
        logger.exception("Cohere Chat API request failed:")
        return {
            "error": "Cohere Chat API failed",
            "exception": str(e)
        }

    try:
        # --- FIX ---
        # The model sometimes wraps the JSON in markdown (e.g., ```json\n{...}\n```)
        # We need to extract the raw JSON string by finding the first '{' and last '}'.
        start_index = generated.find('{')
        end_index = generated.rfind('}')
        
        if start_index != -1 and end_index != -1 and end_index > start_index:
            json_string = generated[start_index : end_index + 1]
            result = json.loads(json_string)
        else:
            # If we can't find a JSON object, raise an error to be caught below
            raise json.JSONDecodeError("Could not find JSON object in model output.", generated, 0)
            
    except Exception as e: # This will catch our new error or json.loads errors
        logger.exception("Failed to parse model output as JSON")
        result = {
            "decision": "risky",
            "confidence": 0.5,
            "explanation": f"Failed to parse model output: {e}. Raw output: {generated[:500]}"
        }

    return {"analysis": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)