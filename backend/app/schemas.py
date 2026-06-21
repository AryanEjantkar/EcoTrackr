from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

# Activity schemas
class ActivityCreate(BaseModel):
    category: str
    subcategory: str
    quantity: float
    notes: Optional[str] = None

class ActivityResponse(ActivityCreate):
    id: int
    co2_emissions: float
    timestamp: datetime

    class Config:
        from_attributes = True

# Goal schemas
class GoalCreate(BaseModel):
    title: str
    category: str
    target_co2: float
    deadline: str

class GoalResponse(GoalCreate):
    id: int
    current_co2: float
    completed: bool
    timestamp: datetime

    class Config:
        from_attributes = True

# Challenge schemas
class ChallengeResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    progress: float
    target: float
    unit: str
    completed: bool
    icon: str

    class Config:
        from_attributes = True

# Community schemas
class CommunityUserResponse(BaseModel):
    id: int
    name: str
    avatar: str
    total_saved: float
    score: int
    rank: Optional[int] = None

    class Config:
        from_attributes = True

# Route Schemas
class RouteOption(BaseModel):
    mode: str          # Car, Bus, Metro, Bicycle, Walking
    distance: float    # km
    duration: float    # minutes
    co2: float         # kg
    recommended: bool

class RouteQuery(BaseModel):
    origin: str
    destination: str

# AI Coach schemas
class AICoachQuery(BaseModel):
    message: str

class CoachSuggestionCard(BaseModel):
    title: str
    details: str
    co2_saving: float
    category: str
    icon: str          # bike, AC, leaf, shop, etc.

class AICoachResponse(BaseModel):
    response: str
    suggestions: List[CoachSuggestionCard]

# OCR schemas
class OCRExtractedData(BaseModel):
    category: str
    subcategory: str
    quantity: float
    quantity_unit: str
    item_name: str
    total_cost: float
    confidence: float

class OCRResponse(BaseModel):
    success: bool
    extracted_data: Optional[OCRExtractedData] = None
    message: str

# Forecasting schemas
class ForecastPoint(BaseModel):
    date: str
    emissions: float
    is_predicted: bool

class ForecastResponse(BaseModel):
    forecast: List[ForecastPoint]
    alert: bool
    message: str

# User & Auth Schemas
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Prediction API Schemas
class PredictCarbonInput(BaseModel):
    day_type: str
    transport_mode: str
    distance_km: float
    electricity_kwh: float
    renewable_usage_pct: float
    food_type: str
    screen_time_hours: float
    waste_generated_kg: float
    eco_actions: int

class PredictCarbonResponse(BaseModel):
    predicted_carbon_footprint: float
    eco_score: int

