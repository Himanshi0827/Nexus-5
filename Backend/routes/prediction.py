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




from flask import Blueprint, request, jsonify

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

    return jsonify({
        "renewal_percentage": 85,
        "health_status": "Healthy"
    })