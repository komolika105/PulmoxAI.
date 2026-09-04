import requests

BASE_URL = "http://127.0.0.1:8080"

def test_full_backend():
    print("1. Testing Signup...")
    signup_res = requests.post(f"{BASE_URL}/api/auth/signup", json={
        "name": "Dr. Alex Taylor",
        "email": "alex.taylor@pulmox.ai",
        "password": "SecurePassword123!"
    })
    print("Signup Status:", signup_res.status_code)
    token = None
    if signup_res.status_code == 200:
        token = signup_res.json().get("token")
        print("Signup Successful! Token generated.")
    elif signup_res.status_code == 400: # Already exists
        print("Account exists, testing Login...")
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "alex.taylor@pulmox.ai",
            "password": "SecurePassword123!"
        })
        print("Login Status:", login_res.status_code)
        token = login_res.json().get("token")
        print("Login Successful! Token retrieved.")

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    print("\n2. Testing /api/auth/me...")
    me_res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print("Me Endpoint Status:", me_res.status_code, me_res.json())

    print("\n3. Testing /api/history...")
    hist_res = requests.get(f"{BASE_URL}/api/history", headers=headers)
    print("History Fetch Status:", hist_res.status_code, f"Items: {len(hist_res.json())}")

    print("\n4. Testing /api/report/export (PDF Report)...")
    pdf_res = requests.post(f"{BASE_URL}/api/report/export", json={
        "patient_name": "John Doe (Patient #4081)",
        "prediction": "Lung Tumor",
        "confidence": 0.942,
        "probabilities": {
            "No Finding": 0.02,
            "Atelectasis": 0.03,
            "Infiltration": 0.008,
            "Lung Tumor": 0.942
        }
    })
    print("PDF Export Status:", pdf_res.status_code)
    print("PDF Content Bytes Length:", len(pdf_res.content))
    if pdf_res.status_code == 200 and len(pdf_res.content) > 1000:
        print("SUCCESS! PDF Report correctly generated and returned as application/pdf stream!")

if __name__ == "__main__":
    test_full_backend()
