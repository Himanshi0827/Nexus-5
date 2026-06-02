# from flask import Blueprint, request, jsonify

# prediction_bp = Blueprint(
#     "prediction",
#     __name__
# )

# @prediction_bp.route(
#     "/predict",
#     methods=["POST"]
# )
# def predict():

#     payload = request.json

#     return jsonify({
#         "renewal_percentage": 82,
#         "health_status": "Healthy",
#         "summary": "Customer has strong engagement",
#         "recommended_actions": [
#             "Schedule renewal discussion",
#             "Offer expansion package"
#         ]
#     })




# from flask import Blueprint, request, jsonify

# prediction_bp = Blueprint("prediction", __name__)

# @prediction_bp.route("/predict", methods=["POST"])
# def predict():
#     """
#     Renewal Prediction
#     ---
#     tags:
#       - AI Prediction

#     consumes:
#       - application/json

#     parameters:
#       - in: body
#         name: body
#         required: true
#         schema:
#           type: object
#           properties:
#             accountName:
#               type: string
#             contractValue:
#               type: string

#     responses:
#       200:
#         description: Success
#     """

#     return jsonify({
#         "renewal_percentage": 85,
#         "health_status": "Healthy"
#     })


from flask import Blueprint, request, jsonify
from services.prediction_service import generate_renewal_prediction  # Adjust this import based on your folder structure

prediction_bp = Blueprint("prediction", __name__)

@prediction_bp.route("/predict", methods=["POST"])
def predict():
    """
    Renewal Prediction
    ---
    tags:
      - AI Prediction
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            accountName:
              type: string
            contractValue:
              type: string
    responses:
      200:
        description: Success
    """
    # 1. Get the JSON payload sent by the user
    account_data = request.json
    
    if not account_data:
        return jsonify({"error": "Missing request body"}), 400

    try:
        # 2. Call your service function that communicates with Gemini
        ai_response_string = generate_renewal_prediction(account_data)
        
        # 3. Because Gemini returns a JSON string, parse it into a Python dict 
        # so Flask can return it as a proper JSON object.
        import json
        ai_response_json = json.loads(ai_response_string)
        
        return jsonify(ai_response_json), 200

    except json.JSONDecodeError:
        # Fallback if Gemini returns markdown code blocks like ```json ... ```
        # clean the string if needed or handle the error
        return jsonify({
            "error": "Failed to parse AI response as JSON",
            "raw_response": ai_response_string
        }), 500
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500