import requests
import random
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("==================================================")
    print("      EcoTrackr API Verification Test Suite       ")
    print("==================================================")

    # 1. Root check
    print("\n[Test 1] Verifying API root...")
    try:
        r = requests.get(f"{BASE_URL}/")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert data.get("status") == "online", f"Expected online status, got {data.get('status')}"
        print(" -> Success: API root is online.")
    except Exception as e:
        print(f" -> Failed: {e}")
        sys.exit(1)

    # 2. Registration & Authentication
    print("\n[Test 2] Verifying User Registration and Login...")
    username = f"tester_{random.randint(10000, 99999)}"
    password = "securepassword123"
    
    # Register
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json={"username": username, "password": password})
        assert r.status_code == 200 or r.status_code == 400, f"Expected 200 or 400 (if exists), got {r.status_code}"
        print(f" -> Registered user: {username}")
    except Exception as e:
        print(f" -> Failed during registration: {e}")
        sys.exit(1)

    # Login
    token = None
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password})
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        res = r.json()
        token = res.get("access_token")
        assert token is not None, "Login did not return access token"
        print(" -> Success: Login token acquired.")
    except Exception as e:
        print(f" -> Failed during login: {e}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # Authenticated user me
    try:
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert r.json().get("username") == username, f"Expected {username}, got {r.json().get('username')}"
        print(" -> Success: Verified authenticated me endpoint.")
    except Exception as e:
        print(f" -> Failed during auth/me: {e}")
        sys.exit(1)

    # 3. Machine Learning predictions
    print("\n[Test 3] Verifying Machine Learning prediction...")
    predict_payload = {
        "day_type": "weekend",
        "transport_mode": "car",
        "distance_km": 25.5,
        "electricity_kwh": 12.0,
        "renewable_usage_pct": 30.0,
        "food_type": "non-veg",
        "screen_time_hours": 6.5,
        "waste_generated_kg": 1.2,
        "eco_actions": 3
    }
    try:
        r = requests.post(f"{BASE_URL}/predict-carbon", json=predict_payload)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        res = r.json()
        assert "predicted_carbon_footprint" in res, "Missing predicted_carbon_footprint in response"
        assert "eco_score" in res, "Missing eco_score in response"
        print(f" -> Success: Predicted footprint = {res['predicted_carbon_footprint']} kg CO2, Eco Score = {res['eco_score']}")
    except Exception as e:
        print(f" -> Failed during prediction: {e}")
        sys.exit(1)

    # 4. Activities log, view, delete
    print("\n[Test 4] Verifying Activities CRUD (Log, Read, Delete)...")
    activity_payload = {
        "category": "Transportation",
        "subcategory": "Car",
        "quantity": 15.0,
        "notes": "Commute to office test"
    }
    activity_id = None
    try:
        # Create
        r = requests.post(f"{BASE_URL}/activities", json=activity_payload, headers=headers)
        if r.status_code != 200:
            print(f"Error detail: {r.text}")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        res = r.json()
        activity_id = res.get("id")
        assert activity_id is not None, "Log activity did not return id"
        print(f" -> Success: Logged activity ID: {activity_id}")

        # Read breakdown
        r = requests.get(f"{BASE_URL}/activities/breakdown", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        print(f" -> Success: Fetched emissions breakdown: {r.json()}")

        # Delete
        r = requests.delete(f"{BASE_URL}/activities/{activity_id}", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        print(f" -> Success: Deleted activity ID: {activity_id}")
    except Exception as e:
        print(f" -> Failed during activities testing: {e}")
        sys.exit(1)

    # 5. Goals log, view, delete
    print("\n[Test 5] Verifying Goals CRUD...")
    goal_payload = {
        "title": "Reduce AC Use",
        "category": "Energy",
        "target_co2": 10.0,
        "deadline": "2026-07-01"
    }
    goal_id = None
    try:
        # Create
        r = requests.post(f"{BASE_URL}/goals", json=goal_payload, headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        goal_id = r.json().get("id")
        assert goal_id is not None, "Log goal did not return id"
        print(f" -> Success: Created goal ID: {goal_id}")

        # Read
        r = requests.get(f"{BASE_URL}/goals", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        goals = r.json()
        assert len(goals) > 0, "Expected at least 1 goal in list"
        print(f" -> Success: Fetched goals list.")

        # Delete
        r = requests.delete(f"{BASE_URL}/goals/{goal_id}", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        print(f" -> Success: Deleted goal ID: {goal_id}")
    except Exception as e:
        print(f" -> Failed during goals testing: {e}")
        sys.exit(1)

    # 6. Challenges
    print("\n[Test 6] Verifying Challenges...")
    try:
        r = requests.get(f"{BASE_URL}/challenges")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        challenges = r.json()
        print(f" -> Success: Fetched challenges list, total: {len(challenges)}")
        
        if len(challenges) > 0:
            cid = challenges[0]["id"]
            r = requests.put(f"{BASE_URL}/challenges/{cid}/progress?progress=5.0")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            print(f" -> Success: Updated progress on challenge ID: {cid}")
    except Exception as e:
        print(f" -> Failed during challenges testing: {e}")
        sys.exit(1)

    # 7. Leaderboard
    print("\n[Test 7] Verifying Community Leaderboard...")
    try:
        r = requests.get(f"{BASE_URL}/community/leaderboard")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        leaderboard = r.json()
        print(f" -> Success: Fetched leaderboard list, total: {len(leaderboard)}")
    except Exception as e:
        print(f" -> Failed during leaderboard: {e}")
        sys.exit(1)

    # 8. Forecasting
    print("\n[Test 8] Verifying Forecast Service...")
    try:
        r = requests.get(f"{BASE_URL}/forecast")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        forecast_data = r.json()
        assert "forecast" in forecast_data, "Missing forecast in response"
        print(f" -> Success: Fetched forecast data containing {len(forecast_data['forecast'])} data points.")
    except Exception as e:
        print(f" -> Failed during forecasting: {e}")
        sys.exit(1)

    # 9. Route Comparator
    print("\n[Test 9] Verifying Route Comparator...")
    route_payload = {
        "origin": "Downtown",
        "destination": "Westside Mall"
    }
    try:
        r = requests.post(f"{BASE_URL}/routes", json=route_payload)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        options = r.json()
        assert len(options) > 0, "Expected route recommendations"
        print(f" -> Success: Fetched route choices (walking, biking, driving, transit).")
    except Exception as e:
        print(f" -> Failed during route comparison: {e}")
        sys.exit(1)

    # 10. Weekly report
    print("\n[Test 10] Verifying Weekly Report Generation...")
    try:
        r = requests.get(f"{BASE_URL}/reports/weekly", headers=headers)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        report = r.json()
        assert "total_emissions" in report, "Missing total_emissions in report"
        assert "primary_recommendation" in report, "Missing primary_recommendation"
        print(f" -> Success: Weekly report generated: total={report['total_emissions']} kg CO2, primary_rec='{report['primary_recommendation']}'")
    except Exception as e:
        print(f" -> Failed during weekly report: {e}")
        sys.exit(1)

    # 11. AI Coach
    print("\n[Test 11] Verifying AI Coach Consultation...")
    coach_payload = {
        "message": "My primary emission is transportation. How can I reduce it?"
    }
    try:
        r = requests.post(f"{BASE_URL}/ai-coach", json=coach_payload)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        res = r.json()
        assert "response" in res, "Missing response text from AI coach"
        print(f" -> Success: Received AI coach feedback: {res['response'][:60]}...")
    except Exception as e:
        print(f" -> Failed during AI coach: {e}")
        sys.exit(1)

    print("\n==================================================")
    print("      ALL ECOTRACKR BACKEND API TESTS PASSED!      ")
    print("==================================================")

if __name__ == "__main__":
    test_api()
