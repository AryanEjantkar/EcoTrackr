# Emission factors in kg CO2 per unit
EMISSION_FACTORS = {
    "Transportation": {
        "Car": 0.18,          # per km
        "Bike": 0.0,           # per km (zero direct emissions)
        "Public Transport": 0.04, # per km (bus/train average)
        "Flight": 0.15,        # per km
    },
    "Energy": {
        "Electricity": 0.82,   # per kWh
        "AC": 1.20,           # per hour of usage
        "Appliances": 0.30,   # per hour of usage
    },
    "Food": {
        "Vegetarian Meal": 0.60, # per meal
        "Non-Vegetarian Meal": 2.50, # per meal (meat-intensive)
        "Food Waste": 1.90,   # per kg
    },
    "Shopping": {
        "Online Purchase": 2.0, # per order
        "Electronics": 80.0,   # per device average
        "Clothing": 8.0,       # per item average
    },
    "Travel": {
        "Hotel Stay": 15.0,    # per night
        "Flight": 0.15,        # per km (alias for convenience)
    }
}

def calculate_co2(category: str, subcategory: str, quantity: float) -> float:
    """
    Calculates carbon emissions in kg based on activity details.
    """
    cat = EMISSION_FACTORS.get(category)
    if not cat:
        # Fallback default factors if category unknown
        return quantity * 1.0

    factor = cat.get(subcategory)
    if factor is None:
        # Check case insensitivity or default category factor
        # If subcategory not found, try to map or get first value
        keys = list(cat.keys())
        factor = cat[keys[0]] if keys else 1.0
    
    return round(quantity * factor, 2)
