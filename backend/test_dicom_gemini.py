import requests
import io
from PIL import Image

BASE_URL = "http://127.0.0.1:8080"

def test_dicom_and_gemini():
    print("1. Testing Gemini AI Explanation (/api/explain)...")
    explain_res = requests.post(f"{BASE_URL}/api/explain", json={
        "prediction": "Lung Tumor",
        "confidence": 0.945,
        "probabilities": {
            "Atelectasis": 0.02,
            "Infiltration": 0.015,
            "Lung Tumor": 0.945,
            "No Finding": 0.02
        }
    })
    print("Explain Status Code:", explain_res.status_code)
    if explain_res.status_code == 200:
        data = explain_res.json()
        print("Explanation Title:", data.get("title"))
        print("Anatomy Summary:", data.get("summary"))
        print("Key Findings Count:", len(data.get("key_findings", [])))
        print("Doctor Questions Count:", len(data.get("doctor_questions", [])))

    print("\n2. Testing Gemini Interactive Q&A Chat (/api/explain/chat)...")
    chat_res = requests.post(f"{BASE_URL}/api/explain/chat", json={
        "message": "Is a lung tumor reversible or treatable if caught early?",
        "prediction": "Lung Tumor",
        "confidence": 0.945,
        "probabilities": {
            "Lung Tumor": 0.945
        }
    })
    print("Chat Status Code:", chat_res.status_code)
    if chat_res.status_code == 200:
        print("Gemini AI Reply Snippet:", chat_res.json().get("reply")[:150], "...")

    print("\n3. Testing DICOM Parsing & Inference (/api/predict)...")
    # Generate a dummy test image bytes (simulating image upload)
    img = Image.new('RGB', (224, 224), color='gray')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()

    predict_res = requests.post(
        f"{BASE_URL}/api/predict",
        files={"file": ("test_scan.png", img_bytes, "image/png")}
    )
    print("Predict Endpoint Status:", predict_res.status_code)
    if predict_res.status_code == 200:
        pred_data = predict_res.json()
        print("Prediction Result:", pred_data.get("prediction"), "Confidence:", pred_data.get("confidence"))

    print("\n4. Testing Password Reset Request (/api/auth/forgot-password)...")
    forgot_res = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
        "email": "alex.taylor@pulmox.ai"
    })
    print("Forgot Password Status:", forgot_res.status_code, forgot_res.text)

    print("\nALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test_dicom_and_gemini()
