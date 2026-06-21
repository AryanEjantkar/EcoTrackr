import os
import datetime
from typing import List, Optional
import joblib
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from . import models, schemas, crud
from .database import engine, get_db
from .services import emissions, ai_coach, ocr, forecasting, routes, auth, predictor

# Create Database tables
models.Base.metadata.create_all(bind=engine)

# Load the joblib prediction model
model = None
try:
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "carbon_model.pkl")
    # Fallback to local sibling or parent path search if needed
    if not os.path.exists(model_path):
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "carbon_model.pkl")
    
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"[EcoTrackr ML] Model loaded successfully from {model_path}.")
    else:
        print("[EcoTrackr ML] WARNING: Models file not found. Prediction service running in fallback.")
except Exception as e:
    print(f"[EcoTrackr ML] Error loading model: {e}")

app = FastAPI(
    title="EcoTrackr API",
    description="Intelligent carbon footprint tracking and reduction platform backend.",
    version="1.0.0"
)

# HTTP Bearer token dependency setup
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        return None
    token = credentials.credentials
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token subject payload.")
    db_user = crud.get_user_by_username(db, username=username)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found.")
    return db_user

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local testing, allow any origin. In production specify NextJS origin.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the EcoTrackr Sustainability Platform API", "status": "online"}

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/auth/register", response_model=schemas.UserResponse, tags=["Authentication"])
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered.")
    return crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.TokenResponse, tags=["Authentication"])
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    
    access_token = auth.create_access_token(data={"sub": db_user.username})
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse(id=db_user.id, username=db_user.username)
    )

@app.get("/auth/me", response_model=schemas.UserResponse, tags=["Authentication"])
def read_users_me(current_user: models.User = Depends(get_current_user)):
    if not current_user:
        return schemas.UserResponse(id=0, username="Guest")
    return schemas.UserResponse(id=current_user.id, username=current_user.username)

# --- MACHINE LEARNING ENDPOINTS ---

@app.post("/predict-carbon", response_model=schemas.PredictCarbonResponse, tags=["Machine Learning"])
def predict_carbon(payload: schemas.PredictCarbonInput):
    estimator = model
    if estimator is None:
        estimator = predictor.CarbonPredictorModel()
        
    try:
        day_type_encoded = 1 if payload.day_type.lower() == "weekend" else 0
        
        transport_lower = payload.transport_mode.lower()
        if "car" in transport_lower:
            transport_encoded = 0
        elif "public" in transport_lower or "transit" in transport_lower or "bus" in transport_lower or "metro" in transport_lower:
            transport_encoded = 1
        elif "bike" in transport_lower or "bicycle" in transport_lower:
            transport_encoded = 2
        elif "flight" in transport_lower or "airplane" in transport_lower or "plane" in transport_lower:
            transport_encoded = 4
        else:
            transport_encoded = 3
            
        food_lower = payload.food_type.lower()
        if "non-veg" in food_lower or "meat" in food_lower:
            food_encoded = 0
        elif "veg" in food_lower:
            food_encoded = 1
        else:
            food_encoded = 2
            
        features = [[
            day_type_encoded,
            transport_encoded,
            payload.distance_km,
            payload.electricity_kwh,
            payload.renewable_usage_pct,
            food_encoded,
            payload.screen_time_hours,
            payload.waste_generated_kg,
            payload.eco_actions
        ]]
        
        pred = estimator.predict(features)[0]
        eco_score = max(0, min(100, round(100 - pred * 5)))
        
        return schemas.PredictCarbonResponse(
            predicted_carbon_footprint=float(round(pred, 2)),
            eco_score=int(eco_score)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# --- ACTIVITIES ENDPOINTS ---

@app.post("/activities", response_model=schemas.ActivityResponse, tags=["Activities"])
def log_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    return crud.create_activity(db, activity, user_id=user_id)

@app.get("/activities", response_model=List[schemas.ActivityResponse], tags=["Activities"])
def read_activities(limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    return crud.get_activities(db, limit=limit, user_id=user_id)

@app.delete("/activities/{activity_id}", tags=["Activities"])
def delete_logged_activity(activity_id: int, db: Session = Depends(get_db)):
    success = crud.delete_activity(db, activity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted successfully", "id": activity_id}

@app.get("/activities/breakdown", tags=["Activities"])
def read_emissions_breakdown(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    return crud.get_emissions_by_category(db, user_id=user_id)

# --- GOALS ENDPOINTS ---

@app.post("/goals", response_model=schemas.GoalResponse, tags=["Goals"])
def log_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    return crud.create_goal(db, goal, user_id=user_id)

@app.get("/goals", response_model=List[schemas.GoalResponse], tags=["Goals"])
def read_goals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    return crud.get_goals(db, user_id=user_id)

@app.delete("/goals/{goal_id}", tags=["Goals"])
def remove_goal(goal_id: int, db: Session = Depends(get_db)):
    success = crud.delete_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted successfully", "id": goal_id}

# --- CHALLENGES ENDPOINTS ---

@app.get("/challenges", response_model=List[schemas.ChallengeResponse], tags=["Challenges"])
def read_challenges(db: Session = Depends(get_db)):
    return crud.get_challenges(db)

@app.put("/challenges/{challenge_id}/progress", response_model=schemas.ChallengeResponse, tags=["Challenges"])
def set_challenge_progress(challenge_id: int, progress: float, db: Session = Depends(get_db)):
    challenge = crud.update_challenge_progress(db, challenge_id, progress)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge

# --- COMMUNITY ENDPOINTS ---

@app.get("/community/leaderboard", response_model=List[schemas.CommunityUserResponse], tags=["Community"])
def read_community(db: Session = Depends(get_db)):
    return crud.get_community_leaderboard(db)

# --- AI SERVICES ENDPOINTS ---

@app.post("/ai-coach", response_model=schemas.AICoachResponse, tags=["AI Coach"])
def consult_ai_coach(query: schemas.AICoachQuery, db: Session = Depends(get_db)):
    return ai_coach.generate_coach_response(db, query)

@app.post("/ocr", response_model=schemas.OCRResponse, tags=["OCR Scanner"])
def upload_receipt_ocr(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        return schemas.OCRResponse(
            success=False,
            message="Invalid file format. Please upload an image receipt."
        )
    return ocr.parse_receipt_image(file)

# --- ANALYTICS AND FORCASTING ---

@app.get("/forecast", response_model=schemas.ForecastResponse, tags=["Forecasting"])
def get_emission_forecast(db: Session = Depends(get_db)):
    return forecasting.get_forecast(db)

# --- ROUTE COMPARATOR ---

@app.post("/routes", response_model=List[schemas.RouteOption], tags=["Route Optimizer"])
def optimize_green_route(query: schemas.RouteQuery):
    if not query.origin or not query.destination:
        raise HTTPException(status_code=400, detail="Origin and destination are required.")
    return routes.get_green_routes(query.origin, query.destination)

# --- WEEKLY REPORT GENERATION ---

@app.get("/reports/weekly", tags=["Reports"])
def generate_weekly_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    activities = crud.get_activities(db, user_id=user_id)
    breakdown = crud.get_emissions_by_category(db, user_id=user_id)
    total_co2 = sum(breakdown.values())
    
    # Analyze areas of improvement
    highest_cat = "Transportation"
    highest_val = 0.0
    for cat, val in breakdown.items():
        if val > highest_val:
            highest_val = val
            highest_cat = cat
            
    # Calculate trees equivalent
    # 1 tree absorbs ~20kg CO2 per year, which is ~1.67kg CO2 per month, or ~0.4kg CO2 per week
    trees_equivalent = round(total_co2 / 20.0, 2)
    
    # Recommendation tip
    tips = {
        "Transportation": "Your transportation footprint represents your primary carbon hotspot. Try swapping two short car rides for cycling or using metro rail transit to save up to 10kg CO2.",
        "Energy": "AC and high-energy home appliances are driving your utility emissions. Setting your cooling to 24 degrees Celsius and washing clothing with cold water will lower these values.",
        "Food": "Diet choices drive carbon outputs. Committing to a Meat-Free Monday or purchasing locally grown groceries will scale down agricultural supply chain emissions.",
        "Shopping": "Consider buying high-quality pre-owned apparel and bundling online purchase items into single shipments to mitigate delivery vehicle mileage.",
        "Travel": "Flights generate intense greenhouse loading. Whenever possible, investigate rail alternatives or opt for eco-certified accommodations."
    }
    
    selected_tip = tips.get(highest_cat, "Continue monitoring your daily habits across all carbon tracker categories.")
    
    # Format current date (using imported datetime module safely)
    report_date = datetime.date.today().strftime("%B %d, %Y")
    
    return {
        "report_date": report_date,
        "total_emissions": round(total_co2, 2),
        "breakdown": breakdown,
        "hotspot_category": highest_cat,
        "hotspot_percentage": round((highest_val / max(total_co2, 1.0)) * 100, 1),
        "trees_equivalent": trees_equivalent,
        "primary_recommendation": selected_tip,
        "summary": f"Your EcoTrackr profile logged {len(activities)} activities this period. Total emissions stand at {round(total_co2, 2)} kg CO2, driven primarily by {highest_cat}."
    }
