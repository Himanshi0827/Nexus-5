import google.generativeai as genai
from config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)

model = genai.GenerativeModel(Config.GEMINI_MODEL)

def get_prediction(prompt):

    response = model.generate_content(prompt)

    return response.text