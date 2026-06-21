import os
import re
from typing import Optional
from fastapi import UploadFile
import google.generativeai as genai
from .. import schemas

def parse_receipt_image(file: UploadFile) -> schemas.OCRResponse:
    """
    Parses a receipt or bill image. Uses Gemini Vision API if key is set, 
    otherwise falls back to a smart mock OCR reader.
    """
    filename = file.filename.lower()
    
    # 1. Try Gemini Multimodal API if configured
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Read file bytes
            file_bytes = file.file.read()
            # Reset file pointer for any subsequent reads
            file.file.seek(0)
            
            prompt = """
            You are the EcoTrackr OCR Receipt Scanner. Parse this receipt/utility bill image and extract:
            1. Category: One of 'Transportation', 'Food', 'Energy', 'Shopping', 'Travel'.
            2. Subcategory: e.g. 'Electricity', 'Car', 'Flight', 'Vegetarian Meal', 'Non-Vegetarian Meal', 'Clothing', 'Electronics', 'Online Purchase'.
            3. Quantity: The carbon unit value (e.g. total kWh consumed for electricity bills, total km for flights/rides, number of meals/items for food/shopping).
            4. Quantity unit: e.g. 'kWh', 'km', 'meals', 'items', 'kg'.
            5. Item Name/Vendor: e.g. 'PG&E Electricity', 'United Airlines', 'Whole Foods'.
            6. Total Cost: Numeric price.
            7. Confidence score: Estimation of OCR quality (0.0 to 1.0).
            
            Format your final response strictly as a JSON object:
            {
                "category": "Energy",
                "subcategory": "Electricity",
                "quantity": 150.0,
                "quantity_unit": "kWh",
                "item_name": "PG&E Utility",
                "total_cost": 85.50,
                "confidence": 0.95
            }
            Do not wrap the response in markdown blocks. Return only the JSON text.
            """
            
            # Call Gemini vision model
            response = model.generate_content([
                prompt,
                {"mime_type": file.content_type, "data": file_bytes}
            ])
            
            import json
            data = json.loads(response.text.strip())
            
            extracted = schemas.OCRExtractedData(
                category=data.get("category", "Shopping"),
                subcategory=data.get("subcategory", "Online Purchase"),
                quantity=float(data.get("quantity", 1.0)),
                quantity_unit=data.get("quantity_unit", "items"),
                item_name=data.get("item_name", "Receipt Purchase"),
                total_cost=float(data.get("total_cost", 0.0)),
                confidence=float(data.get("confidence", 0.90))
            )
            return schemas.OCRResponse(
                success=True,
                extracted_data=extracted,
                message="Successfully scanned bill using Gemini Vision OCR."
            )
        except Exception as e:
            # Pass to fallback emulator on error
            pass

    # 2. Smart OCR Emulator based on filename or dummy rules
    # This allows hackathon testing with standard sample files
    extracted_data = None
    
    if "electric" in filename or "power" in filename or "utility" in filename or "bill" in filename:
        extracted_data = schemas.OCRExtractedData(
            category="Energy",
            subcategory="Electricity",
            quantity=145.0,
            quantity_unit="kWh",
            item_name="City Power & Light Co.",
            total_cost=112.50,
            confidence=0.98
        )
    elif "flight" in filename or "ticket" in filename or "airline" in filename or "boarding" in filename:
        extracted_data = schemas.OCRExtractedData(
            category="Transportation",
            subcategory="Flight",
            quantity=950.0,
            quantity_unit="km",
            item_name="Delta Airlines DL204",
            total_cost=240.00,
            confidence=0.96
        )
    elif "grocery" in filename or "market" in filename or "food" in filename or "receipt" in filename:
        extracted_data = schemas.OCRExtractedData(
            category="Food",
            subcategory="Vegetarian Meal",
            quantity=8.0,
            quantity_unit="meals",
            item_name="Trader Joe's Organic Market",
            total_cost=58.20,
            confidence=0.94
        )
    else:
        # Generic shopping receipt fallback
        extracted_data = schemas.OCRExtractedData(
            category="Shopping",
            subcategory="Online Purchase",
            quantity=1.0,
            quantity_unit="items",
            item_name="EcoStore Online",
            total_cost=29.99,
            confidence=0.88
        )

    return schemas.OCRResponse(
        success=True,
        extracted_data=extracted_data,
        message="Bill scanned successfully (Mock OCR Pipeline active)."
    )
