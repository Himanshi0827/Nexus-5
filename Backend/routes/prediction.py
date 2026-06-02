import json

from flask import Blueprint, jsonify, request

from services.prediction_service import (
    generate_account_analysis,
    generate_chat_response,
    generate_renewal_prediction,
    generate_suggestions,
)

prediction_bp = Blueprint("prediction", __name__)


def parse_ai_json(raw_response):
    if isinstance(raw_response, dict):
        return raw_response

    if not isinstance(raw_response, str):
        raise ValueError("AI response was not JSON text")

    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    return json.loads(cleaned.strip())


def run_ai_endpoint(service_fn):
    payload = request.get_json(silent=True)

    if not payload:
        return jsonify({"error": "Missing request body"}), 400

    try:
        ai_response = service_fn(payload)
        return jsonify(parse_ai_json(ai_response)), 200
    except json.JSONDecodeError as exc:
        return jsonify({
            "error": "Failed to parse AI response as JSON",
            "detail": str(exc),
            "raw_response": ai_response if "ai_response" in locals() else None
        }), 500
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@prediction_bp.route("/predict", methods=["POST"])
def predict():
    return run_ai_endpoint(generate_renewal_prediction)


@prediction_bp.route("/predict/account-analysis", methods=["POST"])
def account_analysis():
    return run_ai_endpoint(generate_account_analysis)


@prediction_bp.route("/predict/suggestions", methods=["POST"])
def suggestions():
    return run_ai_endpoint(generate_suggestions)


@prediction_bp.route("/predict/chat", methods=["POST"])
def chat():
    return run_ai_endpoint(generate_chat_response)
