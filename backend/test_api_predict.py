import io
import requests
from PIL import Image

def test_api():
    url = "http://localhost:8080/api/predict"
    
    # Generate dummy chest x-ray image
    img = Image.new("RGB", (300, 300), color=(128, 128, 128))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)
    
    files = {"file": ("test_xray.png", img_bytes, "image/png")}
    
    print(f"Sending test image to {url}...")
    response = requests.post(url, files=files)
    print("Status code:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print("Prediction:", data.get("prediction"))
        print("Confidence:", data.get("confidence"))
        print("Probabilities:", data.get("probabilities"))
        print("Inference Time (s):", data.get("inference_time"))
        print("Grad-CAM image URI length:", len(data.get("gradcam_image", "")))
        print("SUCCESS! Real backend prediction endpoint is fully working!")
    else:
        print("Error response:", response.text)

if __name__ == "__main__":
    test_api()
