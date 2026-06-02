# import json
# from services.gemini_service import get_prediction

# def generate_renewal_prediction(account_data):

#     prompt = f"""
# You are a Renewal Intelligence Engine.

# Analyze the following account data and return ONLY JSON.

# Account Data:
# {json.dumps(account_data, indent=2)}

# Return format:

# {{
#   "renewal_percentage": 85,
#   "health_status": "Healthy",
#   "risk_level": "Low",
#   "key_reasons": [
#     "...",
#     "..."
#   ],
#   "recommended_actions": [
#     "...",
#     "..."
#   ]
# }}
# """

#     result = get_prediction(prompt)

#     return result


import json
from services.gemini_service import get_prediction

def generate_renewal_prediction(account_data):

    prompt = f"""
You are a Renewal Intelligence Engine.

Analyze the following account data and return a JSON object matching the exact schema requested.

Account Data:
{json.dumps(account_data, indent=2)}

Return format:
{{
  "renewal_percentage": 85,
  "health_status": "Healthy",
  "risk_level": "Low",
  "key_reasons": [
    "...",
    "..."
  ],
  "recommended_actions": [
    "...",
    "..."
  ]
}}
"""
    # Call your underlying gemini client
    result = get_prediction(prompt)
    
    # Quick cleanup helper in case Gemini includes markdown wrappers
    if isinstance(result, str):
        result = result.strip()
        if result.startswith("```json"):
            result = result[7:]
        if result.endswith("```"):
            result = result[:-3]
        result = result.strip()

    return result