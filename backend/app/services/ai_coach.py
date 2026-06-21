import os
import json
from typing import List, Dict
from sqlalchemy.orm import Session
import google.generativeai as genai
from .. import crud, schemas

def get_recent_footprint_context(db: Session) -> Dict:
    """
    Fetches user's current carbon footprint stats for prompt context.
    """
    breakdown = crud.get_emissions_by_category(db)
    total = sum(breakdown.values())
    
    percentages = {}
    if total > 0:
        for cat, val in breakdown.items():
            percentages[cat] = round((val / total) * 100, 1)
    else:
        percentages = {cat: 0.0 for cat in breakdown}
        
    return {
        "breakdown": breakdown,
        "total": round(total, 2),
        "percentages": percentages
    }

def generate_coach_response(db: Session, query: schemas.AICoachQuery) -> schemas.AICoachResponse:
    """
    Generates a personalized response using Gemini or a local heuristic rules engine.
    """
    ctx = get_recent_footprint_context(db)
    message = query.message.lower()
    
    # 1. Try Gemini API
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            You are the EcoTrackr AI Sustainability Coach, a professional climate expert.
            The user is asking: "{query.message}"
            
            Here is the user's actual carbon footprint data:
            - Total emissions logged: {ctx['total']} kg CO2.
            - Category breakdown (kg CO2): {ctx['breakdown']}
            - Category percentages: {ctx['percentages']}%
            
            Give a helpful, positive, and concise response in markdown format (max 3 short paragraphs).
            Additionally, you must recommend 1 to 3 actionable suggestions that are highly relevant to their data and question.
            
            You must format your final output strictly as a JSON object with this structure:
            {{
                "response": "Your markdown-formatted text response goes here",
                "suggestions": [
                    {{
                        "title": "Concise action title (e.g. Switch to public transport)",
                        "details": "Description details (e.g. Saves 4.5kg CO2 per trip)",
                        "co2_saving": 4.5,
                        "category": "Transportation",
                        "icon": "bike" 
                    }}
                ]
            }}
            
            Icon options: 'bike', 'AC', 'leaf', 'shop', 'food'.
            Category options: 'Transportation', 'Food', 'Energy', 'Shopping', 'Travel'.
            Ensure you return valid JSON. Do not include markdown code block syntax (like ```json) in your return value, just the raw JSON text.
            """
            
            response = model.generate_content(prompt)
            data = json.loads(response.text.strip())
            
            # Map items back into response schema
            suggestions = [schemas.CoachSuggestionCard(**item) for item in data.get("suggestions", [])]
            return schemas.AICoachResponse(
                response=data.get("response", "I'm analyzing your footprint metrics now."),
                suggestions=suggestions
            )
        except Exception as e:
            # Fallback to local generator on exception
            pass

    # 2. Smart Dynamic Local Rule-Based Engine (Fallback)
    return generate_mock_coach_response(ctx, message)

def generate_mock_coach_response(ctx: Dict, message: str) -> schemas.AICoachResponse:
    total = ctx["total"]
    percentages = ctx["percentages"]
    
    # Identify top hotspot
    top_category = "Transportation"
    top_pct = 0.0
    for cat, pct in percentages.items():
        if pct > top_pct:
            top_pct = pct
            top_category = cat
            
    # Default response variables
    text_response = ""
    suggestions = []
    
    if "plan" in message or "reduce" in message or "week" in message or "how to" in message:
        text_response = f"""
Based on your carbon footprint, you have accumulated **{total} kg CO₂** in emissions. 
Your primary contributor is **{top_category}**, which accounts for **{top_pct}%** of your total environmental impact. 

By focusing on small adjustments in this area, you can make the fastest impact on your sustainability score. I've designed a weekly reduction plan below targeting your key hotspots.
        """
        
        # Recommendations based on top categories
        if top_category == "Transportation" or total == 0:
            suggestions = [
                schemas.CoachSuggestionCard(
                    title="Switch 2 car trips to bike",
                    details="-3.4kg CO2 expected. Great for health and emissions.",
                    co2_saving=3.4,
                    category="Transportation",
                    icon="bike"
                ),
                schemas.CoachSuggestionCard(
                    title="Carpool or Metro commute",
                    details="Reduces your travel footprint by up to 75% per km.",
                    co2_saving=5.2,
                    category="Transportation",
                    icon="leaf"
                )
            ]
        elif top_category == "Energy":
            suggestions = [
                schemas.CoachSuggestionCard(
                    title="Reduce AC usage",
                    details="Set thermostat to 24°C between 2pm - 6pm.",
                    co2_saving=4.8,
                    category="Energy",
                    icon="AC"
                ),
                schemas.CoachSuggestionCard(
                    title="Unplug idle appliances",
                    details="Prevents vampire power loads. Saves 1.2kg CO2/week.",
                    co2_saving=1.2,
                    category="Energy",
                    icon="leaf"
                )
            ]
        elif top_category == "Food":
            suggestions = [
                schemas.CoachSuggestionCard(
                    title="Meat-free Monday",
                    details="High-impact diet choice. Replace 1 meat meal with plant protein.",
                    co2_saving=1.9,
                    category="Food",
                    icon="food"
                ),
                schemas.CoachSuggestionCard(
                    title="Zero Food Waste Day",
                    details="Avoid food spoilage. Save money and prevent landfill gas.",
                    co2_saving=2.5,
                    category="Food",
                    icon="leaf"
                )
            ]
        else: # Shopping / Travel
            suggestions = [
                schemas.CoachSuggestionCard(
                    title="Consolidate Online Orders",
                    details="Reduces delivery logistics emissions. Saves 2.0kg CO2.",
                    co2_saving=2.0,
                    category="Shopping",
                    icon="shop"
                ),
                schemas.CoachSuggestionCard(
                    title="Buy Pre-owned Apparel",
                    details="Saves raw clothing manufacturing footprint (approx 8kg CO2).",
                    co2_saving=8.0,
                    category="Shopping",
                    icon="shop"
                )
            ]
            
    elif "energy" in message or "electricity" in message or "power" in message:
        text_response = """
Home energy accounts for a significant portion of domestic carbon outputs. In your current log, **Energy** represents **{}%** of your total emissions.

Heating and cooling (AC) are the highest energy consumers. Setting your AC thermostat to 24°C (75°F) instead of 18°C can reduce energy consumption by up to 18%. 
        """.format(percentages.get("Energy", 0.0))
        
        suggestions = [
            schemas.CoachSuggestionCard(
                title="Optimize AC cooling",
                details="Keep AC at 24°C and run a fan to circulate cool air.",
                co2_saving=3.6,
                category="Energy",
                icon="AC"
            ),
            schemas.CoachSuggestionCard(
                title="Wash clothes in cold water",
                details="Saves up to 90% of washing machine energy emissions.",
                co2_saving=2.0,
                category="Energy",
                icon="leaf"
            )
        ]
        
    elif "transport" in message or "car" in message or "commute" in message or "travel" in message:
        text_response = """
Transportation is a high-density emission category. Your logged travel activities account for **{}%** of your carbon footprint.

Taking public transit, walking, or biking is the absolute fastest way to scale down emissions. Cars emit approximately 180g of CO2 per passenger km, whereas metro rail emits only 40g, and biking emits 0g.
        """.format(percentages.get("Transportation", 0.0))
        
        suggestions = [
            schemas.CoachSuggestionCard(
                title="Switch 2 car trips to bike",
                details="-3.4kg CO2 expected. A carbon-free travel alternative.",
                co2_saving=3.4,
                category="Transportation",
                icon="bike"
            ),
            schemas.CoachSuggestionCard(
                title="Take Metro Rail",
                details="Saves 0.14kg CO2 per km compared to driving alone.",
                co2_saving=4.2,
                category="Transportation",
                icon="leaf"
            )
        ]
        
    elif "food" in message or "eat" in message or "diet" in message:
        text_response = """
Food production accounts for nearly a quarter of global greenhouse gases. Currently, **Food** makes up **{}%** of your logged emissions.

Meat, especially beef and lamb, has a carbon intensity 5x to 10x higher than plant-based proteins. Shifting to vegetarian choices even once or twice a week makes a major difference.
        """.format(percentages.get("Food", 0.0))
        
        suggestions = [
            schemas.CoachSuggestionCard(
                title="Meat-free Monday",
                details="Replaces high-impact meat meals with healthy plant alternatives.",
                co2_saving=1.9,
                category="Food",
                icon="food"
            ),
            schemas.CoachSuggestionCard(
                title="Reduce Food Waste",
                details="Save leftovers. Food in landfill decomposes to form high-potency methane.",
                co2_saving=2.2,
                category="Food",
                icon="leaf"
            )
        ]
        
    else:
        text_response = f"""
Hello! I am your **EcoTrackr Sustainability Coach**. 

I monitor your activity entries to provide custom solutions. Currently, your carbon footprint is **{total} kg CO₂**, and your biggest emission driver is **{top_category}** ({top_pct}%).

Ask me questions like *"How can I save energy at home?"*, *"What's my weekly reduction plan?"*, or *"How does my diet affect emissions?"* to get started.
        """
        
        suggestions = [
            schemas.CoachSuggestionCard(
                title="Generate weekly plan",
                details="Asks the AI Coach to compile a 3-step action roadmap.",
                co2_saving=6.8,
                category="Transportation",
                icon="leaf"
            )
        ]
        
    return schemas.AICoachResponse(
        response=text_response.strip(),
        suggestions=suggestions
    )
