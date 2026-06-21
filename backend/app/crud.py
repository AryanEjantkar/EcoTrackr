import datetime
from typing import Optional
from sqlalchemy.orm import Session
from . import models, schemas
from .services.emissions import calculate_co2
from .services.auth import get_password_hash

# User CRUD
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pwd = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_pwd)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Also seed a corresponding CommunityUser leaderboard profile
    leaderboard_user = models.CommunityUser(
        name=f"{user.username} (You)",
        avatar=user.username[0].upper(),
        total_saved=0.0,
        score=84
    )
    db.add(leaderboard_user)
    db.commit()
    
    return db_user

# Activities CRUD
def create_activity(db: Session, activity: schemas.ActivityCreate, user_id: Optional[int] = None):
    co2 = calculate_co2(activity.category, activity.subcategory, activity.quantity)
    db_activity = models.Activity(
        user_id=user_id,
        category=activity.category,
        subcategory=activity.subcategory,
        quantity=activity.quantity,
        co2_emissions=co2,
        notes=activity.notes
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    # Update active goals & challenges that match this category
    update_goals_and_challenges_progress(db, activity.category, co2, activity.subcategory, activity.quantity, user_id)
    
    return db_activity

def get_activities(db: Session, limit: int = 100, user_id: Optional[int] = None):
    query = db.query(models.Activity)
    if user_id is not None:
        query = query.filter(models.Activity.user_id == user_id)
    return query.order_by(models.Activity.timestamp.desc()).limit(limit).all()

def delete_activity(db: Session, activity_id: int):
    db_activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if db_activity:
        db.delete(db_activity)
        db.commit()
        return True
    return False

def get_emissions_by_category(db: Session, user_id: Optional[int] = None):
    query = db.query(models.Activity)
    if user_id is not None:
        query = query.filter(models.Activity.user_id == user_id)
    activities = query.all()
    breakdown = {
        "Transportation": 0.0,
        "Food": 0.0,
        "Energy": 0.0,
        "Shopping": 0.0,
        "Travel": 0.0
    }
    for act in activities:
        if act.category in breakdown:
            breakdown[act.category] += act.co2_emissions
        else:
            breakdown[act.category] = act.co2_emissions
    return breakdown

# Goals CRUD
def create_goal(db: Session, goal: schemas.GoalCreate, user_id: Optional[int] = None):
    db_goal = models.Goal(
        user_id=user_id,
        title=goal.title,
        category=goal.category,
        target_co2=goal.target_co2,
        deadline=goal.deadline
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals(db: Session, user_id: Optional[int] = None):
    query = db.query(models.Goal)
    if user_id is not None:
        query = query.filter(models.Goal.user_id == user_id)
    return query.all()

def delete_goal(db: Session, goal_id: int):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False

# Challenges CRUD
def get_challenges(db: Session):
    # Check if empty and seed default challenges
    count = db.query(models.Challenge).count()
    if count == 0:
        seed_challenges(db)
    return db.query(models.Challenge).all()

def seed_challenges(db: Session):
    defaults = [
        models.Challenge(
            title="No Car Day",
            description="Use public transport, bike, or walk for all travels today.",
            category="Transportation",
            progress=0.0,
            target=10.0,
            unit="km",
            completed=False,
            icon="bike"
        ),
        models.Challenge(
            title="Plastic-Free Day",
            description="Avoid purchasing single-use plastics or online retail orders.",
            category="Shopping",
            progress=0.0,
            target=5.0,
            unit="items",
            completed=False,
            icon="shop"
        ),
        models.Challenge(
            title="Energy Saver Week",
            description="Reduce AC and appliance usage. Keep AC above 24°C.",
            category="Energy",
            progress=0.0,
            target=20.0,
            unit="hours",
            completed=False,
            icon="AC"
        ),
        models.Challenge(
            title="Green Commute Week",
            description="Log 3 public transit or bicycle commute activities.",
            category="Transportation",
            progress=0.0,
            target=3.0,
            unit="commutes",
            completed=False,
            icon="leaf"
        )
    ]
    db.bulk_save_objects(defaults)
    db.commit()

def update_challenge_progress(db: Session, challenge_id: int, progress: float):
    challenge = db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    if challenge:
        challenge.progress = min(progress, challenge.target)
        if challenge.progress >= challenge.target:
            challenge.completed = True
        db.commit()
        db.refresh(challenge)
        return challenge
    return None

# Community CRUD
def get_community_leaderboard(db: Session):
    count = db.query(models.CommunityUser).count()
    if count == 0:
        seed_community(db)
    
    users = db.query(models.CommunityUser).order_by(models.CommunityUser.total_saved.desc()).all()
    # Assign dynamic rank
    for idx, user in enumerate(users):
        user.rank = idx + 1
    db.commit()
    return users

def seed_community(db: Session):
    users = [
        models.CommunityUser(name="Sarah Jenkins", avatar="S", total_saved=245.5, score=92),
        models.CommunityUser(name="David Chen", avatar="D", total_saved=189.2, score=88),
        models.CommunityUser(name="Elena Rostova", avatar="E", total_saved=167.0, score=85),
        models.CommunityUser(name="Liam Patel", avatar="L", total_saved=120.4, score=81),
        models.CommunityUser(name="You (EcoTrackr User)", avatar="Y", total_saved=0.0, score=84) # User starts with 0 saved in database seed
    ]
    db.bulk_save_objects(users)
    db.commit()

# Progress updates helper
def update_goals_and_challenges_progress(db: Session, category: str, co2_saved: float, subcategory: str, quantity: float, user_id: Optional[int] = None):
    # 1. Update goals of the same category (carbon reduction goals)
    goals_query = db.query(models.Goal).filter(models.Goal.category == category, models.Goal.completed == False)
    if user_id is not None:
        goals_query = goals_query.filter(models.Goal.user_id == user_id)
    goals = goals_query.all()
    
    for goal in goals:
        is_green = subcategory in ["Bike", "Public Transport", "Vegetarian Meal"]
        if is_green:
            goal.current_co2 += co2_saved
            if goal.current_co2 >= goal.target_co2:
                goal.completed = True
    
    # 2. Update challenges progress
    # "No Car Day" challenge
    if category == "Transportation" and subcategory in ["Bike", "Public Transport"]:
        challenge = db.query(models.Challenge).filter(models.Challenge.title == "No Car Day").first()
        if challenge and not challenge.completed:
            challenge.progress = min(challenge.progress + quantity, challenge.target)
            if challenge.progress >= challenge.target:
                challenge.completed = True
        
        challenge2 = db.query(models.Challenge).filter(models.Challenge.title == "Green Commute Week").first()
        if challenge2 and not challenge2.completed:
            challenge2.progress = min(challenge2.progress + 1.0, challenge2.target)
            if challenge2.progress >= challenge2.target:
                challenge2.completed = True

    # "Energy Saver Week" challenge
    if category == "Energy" and subcategory in ["AC", "Appliances"]:
        challenge = db.query(models.Challenge).filter(models.Challenge.title == "Energy Saver Week").first()
        if challenge and not challenge.completed:
            # Here we count hours. Let's assume quantity is hours.
            challenge.progress = min(challenge.progress + quantity, challenge.target)
            if challenge.progress >= challenge.target:
                challenge.completed = True

    # "Plastic-Free Day" challenge
    if category == "Shopping" and subcategory in ["Clothing", "Online Purchase"]:
        challenge = db.query(models.Challenge).filter(models.Challenge.title == "Plastic-Free Day").first()
        if challenge and not challenge.completed:
            # Let's say it's progress towards avoiding, e.g. logging shopping actions with notes "Avoided plastic packaging"
            challenge.progress = min(challenge.progress + quantity, challenge.target)
            if challenge.progress >= challenge.target:
                challenge.completed = True

    # 3. Update User saved carbon on Leaderboard
    user = None
    if user_id is not None:
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if db_user:
            user = db.query(models.CommunityUser).filter(models.CommunityUser.name == f"{db_user.username} (You)").first()
    
    if not user:
        user = db.query(models.CommunityUser).filter(models.CommunityUser.name.like("%You%")).first()
        
    if user:
        # Calculate avoided emissions (e.g. if rode bike instead of car, saved 0.18 kg CO2 per km)
        saved = 0.0
        if subcategory == "Bike":
            saved = quantity * 0.18
        elif subcategory == "Public Transport":
            saved = quantity * (0.18 - 0.04) # difference between car and public transport
        elif subcategory == "Vegetarian Meal":
            saved = 2.5 - 0.6  # difference between non-veg and veg meal
        
        user.total_saved += round(saved, 2)
        # Update score based on activity density: increase score
        user.score = min(user.score + 1, 100)
        
    db.commit()
