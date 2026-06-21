import hashlib
from typing import List
from .. import schemas

def get_green_routes(origin: str, destination: str) -> List[schemas.RouteOption]:
    """
    Computes comparative route travel times, distances, and carbon outputs
    for Car, Bus, Metro, Bicycle, and Walking modes.
    Consistent hashing is used to ensure matching origin/dest query values are reproducible.
    """
    # Seed hashing based on origin/destination to make values consistent for queries
    hash_str = f"{origin.lower()}-{destination.lower()}"
    seed = int(hashlib.md5(hash_str.encode('utf-8')).hexdigest()[:6], 16)
    
    # Generate base distance (5 to 25 km)
    base_distance = round(5.0 + (seed % 200) / 10.0, 1)
    
    options = []
    
    # 1. Car
    car_dist = base_distance
    car_dur = round(car_dist * 2.0 + (seed % 10), 1)  # 2 mins per km + traffic delay
    car_co2 = round(car_dist * 0.18, 2)
    
    # 2. Bus
    bus_dist = round(base_distance * 1.15, 1)
    bus_dur = round(bus_dist * 3.0 + (seed % 15), 1)
    bus_co2 = round(bus_dist * 0.04, 2)
    
    # 3. Metro / Rail
    metro_dist = round(base_distance * 1.25, 1)
    metro_dur = round(metro_dist * 1.2 + (seed % 5), 1)
    metro_co2 = round(metro_dist * 0.03, 2)
    
    # 4. Bicycle
    bike_dist = round(base_distance * 0.95, 1)
    bike_dur = round(bike_dist * 4.0, 1) # 4 mins per km
    bike_co2 = 0.0
    
    # 5. Walking
    walk_dist = round(base_distance * 0.9, 1)
    walk_dur = round(walk_dist * 12.0, 1) # 12 mins per km
    walk_co2 = 0.0
    
    # Determine the recommended route
    # For long routes (> 15km), Metro is recommended
    # For mid routes (5 - 15km), Bicycle or Metro is recommended
    # For short routes (< 5km), Walking or Bicycle is recommended
    
    rec_mode = "Metro"
    if base_distance < 4.0:
        rec_mode = "Walking"
    elif base_distance < 8.0:
        rec_mode = "Bicycle"
    elif base_distance < 18.0:
        rec_mode = "Metro"
    else:
        rec_mode = "Bus" # bus or metro depending on seed
        if seed % 2 == 0:
            rec_mode = "Metro"
            
    modes = [
        ("Car", car_dist, car_dur, car_co2),
        ("Bus", bus_dist, bus_dur, bus_co2),
        ("Metro", metro_dist, metro_dur, metro_co2),
        ("Bicycle", bike_dist, bike_dur, bike_co2),
        ("Walking", walk_dist, walk_dur, walk_co2)
    ]
    
    # Assemble schemas
    for name, dist, dur, co2 in modes:
        # Exclude walking/biking for extremely long routes to keep it realistic (> 25km)
        if (name == "Walking" and dist > 15.0) or (name == "Bicycle" and dist > 35.0):
            continue
            
        options.append(
            schemas.RouteOption(
                mode=name,
                distance=dist,
                duration=dur,
                co2=co2,
                recommended=(name == rec_mode)
            )
        )
        
    # Sort options: recommended first, then ascending co2 footprint
    options.sort(key=lambda x: (not x.recommended, x.co2))
    
    return options
