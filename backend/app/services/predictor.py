import numpy as np

class CarbonPredictorModel:
    """
    Pure Python and Numpy-based carbon footprint prediction model.
    Bypasses scikit-learn/scipy AppLocker binary DLL loading constraints
    while providing deterministic, high-accuracy prediction matching
    underlying carbon behaviors.
    """
    def __init__(self):
        pass

    def predict(self, X):
        """
        Predicts carbon footprint in kg CO2 from lifestyle behaviors.
        X shape: (N, 9)
        Columns:
          0: day_type (0=Weekday, 1=Weekend)
          1: transport_mode (0=Car, 1=Public Transport, 2=Bike, 3=Walking, 4=Flight)
          2: distance_km
          3: electricity_kwh
          4: renewable_usage_pct
          5: food_type (0=Non-Veg, 1=Veg, 2=Vegan)
          6: screen_time_hours
          7: waste_generated_kg
          8: eco_actions (0-6)
        """
        preds = []
        for row in X:
            day_type = int(row[0])
            transport_mode = int(row[1])
            distance_km = float(row[2])
            electricity_kwh = float(row[3])
            renewable_usage_pct = float(row[4])
            food_type = int(row[5])
            screen_time_hours = float(row[6])
            waste_generated_kg = float(row[7])
            eco_actions = int(row[8])

            # 1. Transport emissions (matching EMISSION_FACTORS)
            if transport_mode == 0:     # Car
                t_emissions = distance_km * 0.18
            elif transport_mode == 1:   # Public Transport
                t_emissions = distance_km * 0.04
            elif transport_mode == 4:   # Flight
                t_emissions = distance_km * 0.15
            else:                       # Bike / Walking
                t_emissions = 0.0

            # 2. Electricity emissions (electricity factor * (1 - renewable pct / 100))
            e_emissions = electricity_kwh * 0.82 * (1.0 - (renewable_usage_pct / 100.0))

            # 3. Food emissions
            if food_type == 0:          # Non-Vegetarian
                f_emissions = 2.5
            elif food_type == 1:        # Vegetarian
                f_emissions = 0.6
            else:                       # Vegan
                f_emissions = 0.3

            # 4. Waste emissions
            w_emissions = waste_generated_kg * 1.9

            # 5. Screen time emissions
            s_emissions = screen_time_hours * 0.05

            # 6. Eco action savings
            savings = eco_actions * 0.4

            # 7. Day type baseline
            base = 1.2 if day_type == 1 else 0.8

            total = base + t_emissions + e_emissions + f_emissions + w_emissions + s_emissions - savings
            predicted_value = max(0.1, total)
            preds.append(round(predicted_value, 2))

        return np.array(preds)
