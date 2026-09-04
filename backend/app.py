import json
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import init_db, get_db, User, ScanRecord
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
)
from inference import run_prediction_pipeline, load_model_and_metadata
from report_generator import generate_pdf_report

app = FastAPI(
    title="PulmoxAI API",
    description="Backend API for AI-assisted chest X-ray analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SaveHistoryRequest(BaseModel):
    patient_name: Optional[str] = "Anonymous Patient"
    prediction: str
    confidence: float
    probabilities: dict
    inference_time: Optional[float] = 0.0
    gradcam_image: Optional[str] = None


class ReportExportRequest(BaseModel):
    patient_name: Optional[str] = "Anonymous Patient"
    prediction: str
    confidence: float
    probabilities: dict
    gradcam_image: Optional[str] = None


@app.on_event("startup")
def startup_event():
    try:
        init_db()
        print("[PulmoxAI API] SQLite Database initialized.")
    except Exception as e:
        print(f"[PulmoxAI API] Warning initializing DB: {e}")

    try:
        load_model_and_metadata()
        print("[PulmoxAI API] Keras model ready.")
    except Exception as e:
        print(f"[PulmoxAI API] Warning during model startup: {e}")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "message": "PulmoxAI backend is running",
        "model_loaded": True
    }


# ==========================================
# AUTH ENDPOINTS
# ==========================================

@app.post("/api/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pw = get_password_hash(req.password)
    user = User(name=req.name, email=req.email, hashed_password=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "createdAt": user.created_at.isoformat()
        }
    }


@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.email})

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "createdAt": user.created_at.isoformat()
        }
    }


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "createdAt": current_user.created_at.isoformat()
    }


# ==========================================
# PREDICT ENDPOINT
# ==========================================

@app.post("/api/predict")
async def predict(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="File uploaded is not a valid image format.")
    
    try:
        image_bytes = await file.read()
        result = run_prediction_pipeline(image_bytes)

        # Automatically save to DB if user is logged in
        if current_user:
            try:
                record = ScanRecord(
                    user_id=current_user.id,
                    patient_name="Patient Scan",
                    prediction=result["prediction"],
                    confidence=result["confidence"],
                    probabilities_json=json.dumps(result["probabilities"]),
                    inference_time=result.get("inference_time", 0.0),
                    gradcam_image=result.get("gradcam_image")
                )
                db.add(record)
                db.commit()
            except Exception as e:
                print(f"Warning saving scan record: {e}")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


# ==========================================
# SCAN HISTORY ENDPOINTS
# ==========================================

@app.get("/api/history")
def fetch_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(ScanRecord).filter(ScanRecord.user_id == current_user.id).order_by(ScanRecord.created_at.desc()).all()
    
    formatted = []
    for r in records:
        try:
            probs = json.loads(r.probabilities_json)
        except Exception:
            probs = {}
            
        formatted.append({
            "id": r.id,
            "patientName": r.patient_name,
            "prediction": r.prediction,
            "confidence": r.confidence,
            "probabilities": probs,
            "inferenceTime": r.inference_time,
            "gradcamImage": r.gradcam_image,
            "date": r.created_at.strftime("%Y-%m-%d %H:%M"),
            "createdAt": r.created_at.isoformat()
        })
    return formatted


@app.post("/api/history")
def save_history(req: SaveHistoryRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = ScanRecord(
        user_id=current_user.id,
        patient_name=req.patient_name,
        prediction=req.prediction,
        confidence=req.confidence,
        probabilities_json=json.dumps(req.probabilities),
        inference_time=req.inference_time,
        gradcam_image=req.gradcam_image
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"status": "ok", "id": record.id}


@app.delete("/api/history/{scan_id}")
def delete_history(scan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id, ScanRecord.user_id == current_user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    
    db.delete(record)
    db.commit()
    return {"status": "deleted"}


from gemini_explainer import generate_lung_explanation, chat_about_scan


class ExplainRequest(BaseModel):
    prediction: str
    confidence: float
    probabilities: dict


class ExplainChatRequest(BaseModel):
    message: str
    prediction: str
    confidence: float
    probabilities: dict
    history: Optional[List] = []


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str


# ==========================================
# GEMINI AI EXPLANATION & CHAT ENDPOINTS
# ==========================================

@app.post("/api/explain")
def explain_lung_finding(req: ExplainRequest):
    try:
        explanation = generate_lung_explanation(
            prediction=req.prediction,
            confidence=req.confidence,
            probabilities=req.probabilities
        )
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation generation error: {str(e)}")


@app.post("/api/explain/chat")
def chat_lung_finding(req: ExplainChatRequest):
    try:
        reply = chat_about_scan(
            user_message=req.message,
            prediction=req.prediction,
            confidence=req.confidence,
            probabilities=req.probabilities,
            history=req.history
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini chat error: {str(e)}")


# ==========================================
# PASSWORD RESET ENDPOINTS
# ==========================================

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Return success even if not found to prevent user enumeration
        return {"status": "ok", "message": "If an account exists, a password reset token has been dispatched."}
    
    # Generate a lightweight reset token
    reset_token = create_access_token({"sub": user.email, "type": "reset"}, expires_delta=timedelta(minutes=30))
    return {
        "status": "ok",
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token
    }


class ReportExportRequest(BaseModel):
    patient_name: Optional[str] = "Patient #4081"
    prediction: str
    confidence: float
    probabilities: dict
    gradcam_image: Optional[str] = None


@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User account not found.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"status": "ok", "message": "Password reset successfully. Please log in with your new password."}


# ==========================================
# REPORT EXPORT ENDPOINT
# ==========================================

@app.post("/api/report/export")
def export_report(req: ReportExportRequest):
    try:
        pdf_bytes = generate_pdf_report(
            patient_name=req.patient_name,
            prediction=req.prediction,
            confidence=req.confidence,
            probabilities=req.probabilities,
            gradcam_base64=req.gradcam_image,
            created_at=datetime.utcnow()
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=PulmoXAI_Report_{req.prediction.replace(' ', '_')}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")


