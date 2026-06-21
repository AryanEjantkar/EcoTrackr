const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000";

export interface ActivityCreate {
  category: string;
  subcategory: string;
  quantity: number;
  notes?: string;
}

export interface Activity {
  id: number;
  category: string;
  subcategory: string;
  quantity: number;
  co2_emissions: number;
  notes?: string;
  timestamp: string;
}

export interface GoalCreate {
  title: string;
  category: string;
  target_co2: number;
  deadline: string;
}

export interface Goal {
  id: number;
  title: string;
  category: string;
  target_co2: number;
  current_co2: number;
  completed: boolean;
  deadline: string;
  timestamp: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
  icon: string;
}

export interface CommunityUser {
  id: number;
  name: string;
  avatar: string;
  total_saved: number;
  score: number;
  rank?: number;
}

export interface CoachSuggestionCard {
  title: string;
  details: string;
  co2_saving: number;
  category: string;
  icon: string;
}

export interface CoachResponse {
  response: string;
  suggestions: CoachSuggestionCard[];
}

export interface RouteOption {
  mode: string;
  distance: number;
  duration: number;
  co2: number;
  recommended: boolean;
}

export interface ForecastPoint {
  date: string;
  emissions: number;
  is_predicted: boolean;
}

export interface ForecastResponse {
  forecast: ForecastPoint[];
  alert: boolean;
  message: string;
}

export interface WeeklyReport {
  report_date: string;
  total_emissions: number;
  breakdown: Record<string, number>;
  hotspot_category: string;
  hotspot_percentage: number;
  trees_equivalent: number;
  primary_recommendation: string;
  summary: string;
}

export interface PredictCarbonInput {
  day_type: string;
  transport_mode: string;
  distance_km: number;
  electricity_kwh: number;
  renewable_usage_pct: number;
  food_type: string;
  screen_time_hours: number;
  waste_generated_kg: number;
  eco_actions: number;
}

export interface PredictCarbonResponse {
  predicted_carbon_footprint: number;
  eco_score: number;
}

// API helper functions with local mock fallbacks
async function safeFetch<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eco_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call failed for ${url}. Using local fallback data.`, error);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const api = {
  // Activities
  async getActivities(): Promise<Activity[]> {
    return safeFetch<Activity[]>(`${BASE_URL}/activities`, undefined, [
      { id: 1, category: "Transportation", subcategory: "Car", quantity: 15, co2_emissions: 2.7, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
      { id: 2, category: "Food", subcategory: "Vegetarian Meal", quantity: 1, co2_emissions: 0.6, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
      { id: 3, category: "Food", subcategory: "Non-Vegetarian Meal", quantity: 1, co2_emissions: 2.5, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ]);
  },

  async logActivity(data: ActivityCreate): Promise<Activity> {
    // Generate simple mock emission factor if api down
    let factor = 1.0;
    if (data.category === "Transportation") factor = data.subcategory === "Car" ? 0.18 : 0.04;
    else if (data.category === "Food") factor = data.subcategory === "Vegetarian Meal" ? 0.6 : 2.5;
    else if (data.category === "Energy") factor = data.subcategory === "Electricity" ? 0.82 : 1.2;

    const mockResponse: Activity = {
      id: Math.floor(Math.random() * 10000),
      ...data,
      co2_emissions: parseFloat((data.quantity * factor).toFixed(2)),
      timestamp: new Date().toISOString()
    };

    return safeFetch<Activity>(`${BASE_URL}/activities`, {
      method: "POST",
      body: JSON.stringify(data),
    }, mockResponse);
  },

  async deleteActivity(id: number): Promise<{ message: string; id: number }> {
    return safeFetch<{ message: string; id: number }>(`${BASE_URL}/activities/${id}`, {
      method: "DELETE"
    }, { message: "Deleted locally", id });
  },

  async getBreakdown(): Promise<Record<string, number>> {
    return safeFetch<Record<string, number>>(`${BASE_URL}/activities/breakdown`, undefined, {
      Transportation: 18.4,
      Food: 12.3,
      Energy: 10.2,
      Shopping: 8.0,
      Travel: 15.0
    });
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    return safeFetch<Goal[]>(`${BASE_URL}/goals`, undefined, [
      { id: 1, title: "Reduce Travel Footprint", category: "Transportation", target_co2: 25.0, current_co2: 12.4, completed: false, deadline: "2026-06-30", timestamp: new Date().toISOString() },
      { id: 2, title: "Eat Vegetarian", category: "Food", target_co2: 15.0, current_co2: 15.0, completed: true, deadline: "2026-06-25", timestamp: new Date().toISOString() }
    ]);
  },

  async logGoal(data: GoalCreate): Promise<Goal> {
    const mockGoal: Goal = {
      id: Math.floor(Math.random() * 10000),
      ...data,
      current_co2: 0.0,
      completed: false,
      timestamp: new Date().toISOString()
    };
    return safeFetch<Goal>(`${BASE_URL}/goals`, {
      method: "POST",
      body: JSON.stringify(data)
    }, mockGoal);
  },

  async deleteGoal(id: number): Promise<{ message: string; id: number }> {
    return safeFetch<{ message: string; id: number }>(`${BASE_URL}/goals/${id}`, {
      method: "DELETE"
    }, { message: "Deleted locally", id });
  },

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    return safeFetch<Challenge[]>(`${BASE_URL}/challenges`, undefined, [
      { id: 1, title: "No Car Day", description: "Use public transport, bike, or walk for all travels today.", category: "Transportation", progress: 8.0, target: 10.0, unit: "km", completed: false, icon: "bike" },
      { id: 2, title: "Plastic-Free Day", description: "Avoid purchasing single-use plastics or online retail orders.", category: "Shopping", progress: 3.0, target: 5.0, unit: "items", completed: false, icon: "shop" },
      { id: 3, title: "Energy Saver Week", description: "Reduce AC and appliance usage. Keep AC above 24°C.", category: "Energy", progress: 20.0, target: 20.0, unit: "hours", completed: true, icon: "AC" },
      { id: 4, title: "Green Commute Week", description: "Log 3 public transit or bicycle commute activities.", category: "Transportation", progress: 1.0, target: 3.0, unit: "commutes", completed: false, icon: "leaf" }
    ]);
  },

  async updateChallengeProgress(id: number, progress: number): Promise<Challenge> {
    // Return mock update
    const mockChallenge: Challenge = {
      id,
      title: "Updated Challenge",
      description: "Challenge progress updated",
      category: "Transportation",
      progress,
      target: 10.0,
      unit: "units",
      completed: progress >= 10.0,
      icon: "leaf"
    };

    return safeFetch<Challenge>(`${BASE_URL}/challenges/${id}/progress?progress=${progress}`, {
      method: "PUT"
    }, mockChallenge);
  },

  // Leaderboard
  async getLeaderboard(): Promise<CommunityUser[]> {
    return safeFetch<CommunityUser[]>(`${BASE_URL}/community/leaderboard`, undefined, [
      { id: 1, name: "Sarah Jenkins", avatar: "S", total_saved: 245.5, score: 92, rank: 1 },
      { id: 2, name: "David Chen", avatar: "D", total_saved: 189.2, score: 88, rank: 2 },
      { id: 3, name: "Elena Rostova", avatar: "E", total_saved: 167.0, score: 85, rank: 3 },
      { id: 4, name: "Liam Patel", avatar: "L", total_saved: 120.4, score: 81, rank: 4 },
      { id: 5, name: "You (EcoTrackr User)", avatar: "Y", total_saved: 42.8, score: 84, rank: 5 }
    ]);
  },

  // AI Coach
  async consultCoach(message: string): Promise<CoachResponse> {
    const mockCoachResponse: CoachResponse = {
      response: `I've analyzed your current carbon activities. Your primary carbon contributor is **Transportation** (driving a Car). \n\nBy replacing just 2 car trips per week with public transit or bicycling, you can decrease your weekly footprint by **5.2 kg CO₂**. I've added a few strategies below to help you get started.`,
      suggestions: [
        { title: "Switch 2 car trips to bike", details: "-3.4kg CO2 expected. Great for health and emissions.", co2_saving: 3.4, category: "Transportation", icon: "bike" },
        { title: "Metro commuting alternative", details: "Reduces travel footprint by up to 75% per km.", co2_saving: 5.2, category: "Transportation", icon: "leaf" }
      ]
    };
    return safeFetch<CoachResponse>(`${BASE_URL}/ai-coach`, {
      method: "POST",
      body: JSON.stringify({ message })
    }, mockCoachResponse);
  },

  // OCR Scanner
  async scanReceipt(file: File): Promise<{ success: boolean; extracted_data?: any; message: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const name = file.name.toLowerCase();
    let mockResult = {
      category: "Energy",
      subcategory: "Electricity",
      quantity: 145.0,
      quantity_unit: "kWh",
      item_name: "City Power & Light Co.",
      total_cost: 112.50,
      confidence: 0.98
    };

    if (name.includes("flight") || name.includes("ticket")) {
      mockResult = {
        category: "Transportation",
        subcategory: "Flight",
        quantity: 950.0,
        quantity_unit: "km",
        item_name: "Delta Airlines DL204",
        total_cost: 240.00,
        confidence: 0.96
      };
    } else if (name.includes("grocery") || name.includes("food")) {
      mockResult = {
        category: "Food",
        subcategory: "Vegetarian Meal",
        quantity: 8.0,
        quantity_unit: "meals",
        item_name: "Trader Joe's Organic Market",
        total_cost: 58.20,
        confidence: 0.94
      };
    }

    try {
      const res = await fetch(`${BASE_URL}/ocr`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("HTTP error");
      return await res.json();
    } catch (e) {
      console.warn("OCR API failed. Returning mock result.", e);
      return {
        success: true,
        extracted_data: mockResult,
        message: "Successfully scanned bill (Mock OCR Pipeline active)."
      };
    }
  },

  // Forecast
  async getForecast(): Promise<ForecastResponse> {
    const today = new Date();
    const dates = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 6 + i);
      return d.toISOString().split("T")[0];
    });

    const mockResponse: ForecastResponse = {
      forecast: [
        { date: dates[0], emissions: 12.5, is_predicted: false },
        { date: dates[1], emissions: 14.2, is_predicted: false },
        { date: dates[2], emissions: 10.8, is_predicted: false },
        { date: dates[3], emissions: 15.6, is_predicted: false },
        { date: dates[4], emissions: 13.0, is_predicted: false },
        { date: dates[5], emissions: 11.2, is_predicted: false },
        { date: dates[6], emissions: 14.5, is_predicted: false },
        { date: dates[7], emissions: 15.1, is_predicted: true },
        { date: dates[8], emissions: 15.8, is_predicted: true },
        { date: dates[9], emissions: 16.4, is_predicted: true },
        { date: dates[10], emissions: 17.0, is_predicted: true },
        { date: dates[11], emissions: 17.6, is_predicted: true },
        { date: dates[12], emissions: 18.2, is_predicted: true },
        { date: dates[13], emissions: 18.9, is_predicted: true },
      ],
      alert: true,
      message: "Emission Trend: Projected 8.5% Increase Next Week. Your AC energy use is trending upwards."
    };

    return safeFetch<ForecastResponse>(`${BASE_URL}/forecast`, undefined, mockResponse);
  },

  // Routes
  async getRoutes(origin: string, destination: string): Promise<RouteOption[]> {
    return safeFetch<RouteOption[]>(`${BASE_URL}/routes`, {
      method: "POST",
      body: JSON.stringify({ origin, destination })
    }, [
      { mode: "Walking", distance: 1.8, duration: 25.0, co2: 0.0, recommended: true },
      { mode: "Bicycle", distance: 2.1, duration: 8.0, co2: 0.0, recommended: false },
      { mode: "Metro", distance: 2.5, duration: 12.0, co2: 0.08, recommended: false },
      { mode: "Bus", distance: 2.3, duration: 18.0, co2: 0.1, recommended: false },
      { mode: "Car", distance: 1.8, duration: 15.0, co2: 0.32, recommended: false },
    ]);
  },

  // Weekly Report
  async getWeeklyReport(): Promise<WeeklyReport> {
    return safeFetch<WeeklyReport>(`${BASE_URL}/reports/weekly`, undefined, {
      report_date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      total_emissions: 63.9,
      breakdown: {
        Transportation: 28.7,
        Food: 15.2,
        Energy: 12.0,
        Shopping: 8.0,
        Travel: 0.0
      },
      hotspot_category: "Transportation",
      hotspot_percentage: 45,
      trees_equivalent: 3.2,
      primary_recommendation: "Your transportation footprint represents your primary carbon hotspot. Try swapping two short car rides for cycling or using metro rail transit to save up to 10kg CO2.",
      summary: "Your EcoTrackr profile logged 12 activities this period. Total emissions stand at 63.9 kg CO2, driven primarily by Transportation."
    });
  },

  // Authentication
  async register(username: string, password: string): Promise<any> {
    return safeFetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  async login(username: string, password: string): Promise<any> {
    const res = await safeFetch<any>(`${BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (res && res.access_token) {
      localStorage.setItem("eco_token", res.access_token);
      localStorage.setItem("eco_user", JSON.stringify(res.user));
    }
    return res;
  },

  async getMe(): Promise<any> {
    return safeFetch(`${BASE_URL}/auth/me`, undefined, { id: 0, username: "Guest" });
  },

  logout() {
    localStorage.removeItem("eco_token");
    localStorage.removeItem("eco_user");
  },

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("eco_token");
    }
    return false;
  },

  // Prediction API
  async predictCarbon(data: PredictCarbonInput): Promise<PredictCarbonResponse> {
    return safeFetch<PredictCarbonResponse>(`${BASE_URL}/predict-carbon`, {
      method: "POST",
      body: JSON.stringify(data),
    }, {
      predicted_carbon_footprint: 8.72,
      eco_score: 76
    });
  }
};
