import os
import json
import time
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
    GEMINI_API_KEY = ""

GEMINI_TIMEOUT_MS = max(10000, int(os.getenv("GEMINI_TIMEOUT_MS", "10000")))
GEMINI_MODEL = "gemini-3.8-flash"
GEMINI_QUOTA_COOLDOWN_SECONDS = 30
_GEMINI_CLIENT = None
_GEMINI_UNAVAILABLE_UNTIL = 0.0


def _generate_gemini_content(prompt: str, response_mime_type: str, max_output_tokens: int) -> str:
    global _GEMINI_CLIENT, _GEMINI_UNAVAILABLE_UNTIL
    from google import genai
    from google.genai import types

    if time.monotonic() < _GEMINI_UNAVAILABLE_UNTIL:
        raise RuntimeError("Gemini is temporarily rate-limited; using the structured fallback")

    if _GEMINI_CLIENT is None:
        _GEMINI_CLIENT = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=types.HttpOptions(
                timeout=GEMINI_TIMEOUT_MS,
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )

    try:
        response = _GEMINI_CLIENT.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=max_output_tokens,
                response_mime_type=response_mime_type,
            ),
        )
    except Exception as error:
        message = str(error)
        if "429" in message or "RESOURCE_EXHAUSTED" in message:
            _GEMINI_UNAVAILABLE_UNTIL = time.monotonic() + GEMINI_QUOTA_COOLDOWN_SECONDS
        raise
    if not response or not response.text:
        raise RuntimeError("Gemini returned an empty response")
    _GEMINI_UNAVAILABLE_UNTIL = 0.0
    return response.text.strip()


def get_fallback_explanation(prediction: str, confidence: float, probabilities: dict) -> dict:
    conf_pct = f"{confidence * 100:.1f}%"
    
    if prediction == "Lung Tumor":
        return {
            "title": "Understanding Your X-Ray Finding: Lung Mass / Tumor Signal",
            "summary": f"The AI model identified patterns consistent with a localized tissue density or mass (Lung Tumor) with {conf_pct} confidence.",
            "lung_anatomy_explanation": (
                "A lung tumor or pulmonary mass is an abnormal growth of cells within the lung tissue or bronchial airways. "
                "In a chest X-ray, this appears as a focal opacity or shadow where dense cell accumulation absorbs X-ray beams "
                "more than surrounding air-filled lung sacs (alveoli). It can restrict airflow and oxygen exchange in that segment of the lung."
            ),
            "key_findings": [
                "Focal area of increased radiological opacity identified in the lung field.",
                "Disruption of normal translucent vascular markings in the affected segment.",
                f"Statistical class probability score: {conf_pct} (Highest matching category)."
            ],
            "symptoms_to_monitor": [
                "Persistent cough or changes in a chronic cough",
                "Shortness of breath or wheezing during mild exertion",
                "Chest discomfort or localized pain when breathing deeply",
                "Unexplained fatigue or coughing up blood-tinged sputum"
            ],
            "doctor_questions": [
                "Would a high-resolution Chest CT scan be recommended to evaluate this area in 3D?",
                "What diagnostic tests (e.g. biopsy, bronchoscopy) are needed to characterize this finding?",
                "Are there previous imaging scans we can compare this X-ray against?"
            ],
            "next_steps": "Schedule an urgent consultation with a pulmonologist or your primary care physician for diagnostic confirmation and CT imaging."
        }
    elif prediction == "Atelectasis":
        return {
            "title": "Understanding Your X-Ray Finding: Atelectasis (Partial Lung Collapse)",
            "summary": f"The AI model detected features indicative of Atelectasis (collapsed lung tissue) with {conf_pct} confidence.",
            "lung_anatomy_explanation": (
                "Atelectasis occurs when tiny air sacs (alveoli) within a portion of the lung deflate or collapse, "
                "reducing oxygen absorption in that lobe. On an X-ray, collapsed lung tissue appears denser and whiter "
                "because it loses its normal air volume, often shifting nearby lung structures slightly toward the affected area."
            ),
            "key_findings": [
                "Volume loss and increased density in the affected lung zone.",
                "Fissural displacement or subtle tracheal/mediastinal shift toward the collapsed area.",
                f"Statistical class probability score: {conf_pct}."
            ],
            "symptoms_to_monitor": [
                "Rapid or shallow breathing (tachypnea)",
                "Mild to moderate chest tightness or localized pain",
                "Coughing due to airway irritation or mucus plugging",
                "Feeling winded during routine daily activities"
            ],
            "doctor_questions": [
                "Is this atelectasis caused by airway blockage, deep breathing restriction, or fluid?",
                "Will deep breathing exercises or an incentive spirometer help re-expand the lung?",
                "Do I need follow-up imaging after performing airway clearance techniques?"
            ],
            "next_steps": "Consult your physician for airway clearance guidance and deep-breathing therapy to re-expand collapsed alveoli."
        }
    elif prediction == "Infiltration":
        return {
            "title": "Understanding Your X-Ray Finding: Pulmonary Infiltration / Inflammation",
            "summary": f"The AI model highlighted radiological signs of Pulmonary Infiltration with {conf_pct} confidence.",
            "lung_anatomy_explanation": (
                "Pulmonary infiltration occurs when substances denser than air — such as fluid, pus, blood, or inflammatory cells — "
                "accumulate inside the lung tissue or air sacs. On a chest X-ray, this presents as patchy, hazy, or cloudy white regions "
                "(infiltrates) overlaying normally dark lung fields, commonly associated with pneumonia or inflammatory responses."
            ),
            "key_findings": [
                "Patchy airspace opacities distributed across the lung parenchyma.",
                "Hazy consolidation obscuring underlying pulmonary vascular markings.",
                f"Statistical class probability score: {conf_pct}."
            ],
            "symptoms_to_monitor": [
                "Fever, chills, or night sweats",
                "Productive cough with colored or thick phlegm",
                "Shortness of breath or sharp chest pain when inhaling",
                "General malaise, body aches, and fatigue"
            ],
            "doctor_questions": [
                "Could this infiltration be caused by an infectious process such as pneumonia?",
                "Are blood tests (CBC, CRP) or sputum cultures needed to identify the exact cause?",
                "Would targeted antibiotic or anti-inflammatory treatment be appropriate?"
            ],
            "next_steps": "Follow up with a healthcare provider for clinical evaluation, laboratory workups, and potential antimicrobial or anti-inflammatory therapy."
        }
    elif prediction == "Pneumonia":
        return {
            "title": "Understanding Your X-Ray Finding: Pneumonia Pattern",
            "summary": f"The model found image features that can be associated with pneumonia ({conf_pct}). An X-ray alone cannot confirm the cause.",
            "lung_anatomy_explanation": (
                "Pneumonia can inflame the lung tissue and fill some air sacs with fluid or inflammatory material. "
                "On an X-ray, this may appear as a localized or patchy opacity. Similar appearances can have other causes, "
                "so a clinician must interpret the image together with symptoms and examination findings."
            ),
            "key_findings": [
                "The model detected a pattern associated with the pneumonia class.",
                "The raw model probability is not a confirmed diagnosis.",
                "Clinical history and radiologist review are needed for interpretation."
            ],
            "symptoms_to_monitor": [
                "Fever or chills",
                "Persistent or worsening cough",
                "Shortness of breath",
                "Chest pain when breathing or coughing"
            ],
            "doctor_questions": [
                "Does the X-ray show consolidation consistent with my symptoms?",
                "Do I need additional testing to determine the cause?",
                "What symptoms should prompt urgent reassessment?"
            ],
            "next_steps": "Discuss the image and symptoms with a qualified healthcare professional; seek urgent care for severe breathing difficulty or rapidly worsening symptoms."
        }
    elif prediction == "Tuberculosis":
        return {
            "title": "Understanding Your X-Ray Finding: Tuberculosis-Associated Pattern",
            "summary": f"The model found image features associated with tuberculosis ({conf_pct}); this result cannot determine whether TB is active or confirm infection.",
            "lung_anatomy_explanation": (
                "Tuberculosis can affect lung tissue and produce areas of opacity or other changes on chest imaging. "
                "These findings are not specific to TB, and an X-ray cannot distinguish active disease from prior infection. "
                "A clinician may consider symptoms, exposure history, sputum testing, and other laboratory tests."
            ),
            "key_findings": [
                "The model detected a pattern associated with the tuberculosis class.",
                "Imaging alone cannot confirm active tuberculosis.",
                "Clinical and laboratory evaluation is needed."
            ],
            "symptoms_to_monitor": [
                "A cough lasting several weeks",
                "Fever or night sweats",
                "Unexplained weight loss",
                "Coughing up blood"
            ],
            "doctor_questions": [
                "Should I have a TB blood or skin test and sputum testing?",
                "Does my exposure history change the recommended evaluation?",
                "Should I take precautions while awaiting assessment?"
            ],
            "next_steps": "Contact a healthcare professional or local public-health service for appropriate TB assessment, especially if you have symptoms or a known exposure."
        }
    else: # No Finding / Normal
        return {
            "title": "Understanding Your X-Ray Finding: Normal / Clear Lung Fields",
            "summary": f"The AI model found no major radiological abnormalities (No Finding) with {conf_pct} confidence.",
            "lung_anatomy_explanation": (
                "Your chest X-ray shows clear, translucent lung fields with normal lung volume and intact vascular markings. "
                "The air sacs (alveoli) appear well-expanded without focal masses, dense infiltrates, or significant structural collapse."
            ),
            "key_findings": [
                "Symmetrical bilateral lung translucency with clear costophrenic angles.",
                "No focal pulmonary mass, consolidation, or significant atelectasis detected.",
                f"Normal pattern confidence score: {conf_pct}."
            ],
            "symptoms_to_monitor": [
                "If you still experience persistent cough, shortness of breath, or chest discomfort, notify your doctor.",
                "Chest X-rays may not detect subtle soft-tissue changes or early-stage airway inflammation."
            ],
            "doctor_questions": [
                "Does this clear X-ray rule out my symptoms, or should we consider non-radiological tests?",
                "Are pulmonary function tests (PFTs) or allergy assessments recommended if symptoms persist?"
            ],
            "next_steps": "Maintain routine health checkups. If physical respiratory symptoms persist, consult your physician for clinical evaluation."
        }


def generate_lung_explanation(prediction: str, confidence: float, probabilities: dict) -> dict:
    if not GEMINI_API_KEY:
        return get_fallback_explanation(prediction, confidence, probabilities)

    try:
        prompt = f"""
        You are an expert, compassionate pulmonologist and medical educator.
        A chest X-ray AI model analyzed a patient's scan and returned the following result:
        - Primary Predicted Condition: {prediction}
        - AI Confidence Score: {confidence * 100:.1f}%
        - Full Class Probabilities: {json.dumps(probabilities)}

        Explain in clear, empathetic, easy-to-understand medical terms what has happened to their lungs.
        Respond ONLY with a raw JSON object containing these exact keys:
        {{
            "title": "Clear catchy title",
            "summary": "1-2 sentence overview of finding",
            "lung_anatomy_explanation": "Detailed 3-4 sentence explanation of what is happening inside the lung tissue, alveoli, and airways for this condition",
            "key_findings": ["Point 1", "Point 2", "Point 3"],
            "symptoms_to_monitor": ["Symptom 1", "Symptom 2", "Symptom 3", "Symptom 4"],
            "doctor_questions": ["Question 1", "Question 2", "Question 3"],
            "next_steps": "Clear clinical advice on next steps"
        }}
        """

        clean_text = _generate_gemini_content(
            prompt,
            response_mime_type="application/json",
            max_output_tokens=700,
        )
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        return json.loads(clean_text)

    except Exception as e:
        print(f"[Gemini API Warning] {e}. Using structured medical template.")
        return get_fallback_explanation(prediction, confidence, probabilities)


def chat_about_scan(user_message: str, prediction: str, confidence: float, probabilities: dict, history: list = None) -> str:
    if not GEMINI_API_KEY:
        return (
            f"Based on your X-ray result ({prediction} with {confidence*100:.1f}% confidence), "
            f"it is important to discuss '{user_message}' with your doctor. {prediction} can affect oxygen exchange "
            f"and airflow in the lung tissue. A physician can perform physical auscultation and order follow-up CT scans."
        )

    try:
        prompt = f"""
        You are PulmoXAI's empathetic medical AI assistant.
        Patient's X-ray scan prediction: {prediction} ({confidence*100:.1f}% confidence).
        Probabilities: {json.dumps(probabilities)}.

        Patient Question: "{user_message}"

        Provide a supportive, informative, 2-3 paragraph answer explaining how this relates to their lung condition.
        Always remind them to consult a qualified physician for clinical diagnosis.
        """

        return _generate_gemini_content(
            prompt,
            response_mime_type="text/plain",
            max_output_tokens=450,
        )

    except Exception as e:
        print(f"[Gemini Chat Warning] {e}")
        return f"Regarding your question '{user_message}': In the context of {prediction}, it's recommended to consult your physician for personalized evaluation."
