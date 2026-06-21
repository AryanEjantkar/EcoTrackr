import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)  # Nullable for seed compatibility
    category = Column(String, index=True)  # Transportation, Food, Energy, Shopping, Travel
    subcategory = Column(String)           # Car, Bike, Flights, Veg meal, etc.
    quantity = Column(Float)               # e.g., km, kWh, meals count
    co2_emissions = Column(Float)          # kg CO2
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)  # Nullable for seed compatibility
    title = Column(String, index=True)
    category = Column(String)              # Transportation, Food, Energy, Shopping, Travel
    target_co2 = Column(Float)             # Target footprint reduction (kg)
    current_co2 = Column(Float, default=0.0)
    deadline = Column(String)              # date string
    completed = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    category = Column(String)
    progress = Column(Float, default=0.0)
    target = Column(Float)
    unit = Column(String)                  # km, items, days, meals
    completed = Column(Boolean, default=False)
    icon = Column(String)                  # e.g. bike, AC, leaf, shop

class CommunityUser(Base):
    __tablename__ = "community_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    avatar = Column(String)                # avatar url or letter
    total_saved = Column(Float, default=0.0) # total CO2 saved in kg
    score = Column(Integer, default=50)    # sustainability score 0-100
    rank = Column(Integer, nullable=True)
