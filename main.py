from fastapi import FastAPI, HTTPException, File, UploadFile
import httpx
import shutil
from file_processing import process_file
import google as genai
import os
from pydantic import BaseModel
import json


genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    temp_path = f"/tmp/{file.filename}"
    print(f"Saving to temporary path: {temp_path}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print("File saved to temporary path.")
        processed_file_path = process_file(temp_path)
        print(f"Processed file path: {processed_file_path}")
        
        if processed_file_path:
            return {"filepath": processed_file_path}
        else:
            print("File processing failed: Invalid file type.")
            raise HTTPException(status_code=400, detail="Invalid file type")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")



# --- Main endpoint: Analyze Food Based on Bloodwork + Food ---

# --- Mock storage for lab results (replace with session/db later) ---
user_lab_results = {}

class FoodData(BaseModel):
    product_name: str
    ingredients: str = None
    nutri_score: str = None
    nutrients: list = None


@app.post("/analyze-food")
async def analyze_food(food_data: FoodData):
    if "latest" not in user_lab_results:
        raise HTTPException(status_code=400, detail="No bloodwork uploaded yet")

    image = user_lab_results["latest"]

    # Prepare food context
    food_json_str = json.dumps(food_data.dict(), indent=2)

    # Define system instruction
    system_instruction = """
You are a personalized AI nutritionist. You analyze a person's blood test results and food items to give a health suitability score from 1 to 5:
- 5: Excellent choice based on their labs
- 4: Good, minor concerns
- 3: Neutral or mixed impact
- 2: Not ideal, potential risk
- 1: Avoid — conflicts with health markers

Consider:
- High LDL? → flag saturated fat
- Prediabetic? → flag sugar
- Low vitamin D? → bonus for fortified foods
- High uric acid? → avoid high-purine foods

Always be scientific, concise, and empathetic.
Return ONLY a JSON object:
{"score": 3, "reasoning": "Your LDL is elevated..."}
Do not include any other text.
"""

    try:
        # Call Gemini
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction.strip()
        )

        response = model.generate_content(
            contents=[
                image,
                f"Here is the food item to evaluate:\n{food_json_str}"
            ]
        )

        if not response.text:
            raise HTTPException(status_code=500, detail="Empty response from Gemini")

        # Try to extract JSON from response
        text = response.text.strip()
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            result = json.loads(text[start:end])
            return result
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse Gemini JSON: {e}. Raw output: {text}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


# A reusable async client for making API calls
# The 'with' statement ensures it's properly closed
async def get_product_data(barcode: str):
    api_url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}.json"
    
    # Use httpx.AsyncClient for async requests
    async with httpx.AsyncClient() as client:
        # Note: httpx and requests handle Basic Auth easily with the 'auth' tuple
        # This is cleaner than manually encoding with base64
        response = await client.get(api_url, auth=('off', 'off'))
        
        # --- 1. Handle API Errors ---
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Product not found or API error.")
            
        data = response.json()
        
        if data.get("status") == 0:
            raise HTTPException(status_code=404, detail=f"Product with barcode {barcode} not found.")
            
        return data.get("product")

@app.get("/product/{barcode}")
async def fetch_product(barcode: str):
    product_data = await get_product_data(barcode)
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Product data is empty.")
    
    # --- 2. Extract the Useful Parts ---
    # Using .get() is safer than ['key'] because it returns None if the key doesn't exist, preventing crashes.
    
    nutriments = product_data.get("nutriments", {})
    
    useful_data = {
        # Basic Identification
        "barcode": product_data.get("code"),
        "product_name": product_data.get("product_name_fr") or product_data.get("product_name"),
        "brands": product_data.get("brands"),
        "image_url": product_data.get("image_front_url"),
        
        # Core Health & Nutrition
        "ingredients": product_data.get("ingredients_text_fr") or product_data.get("ingredients_text"),
        "allergens": product_data.get("allergens_hierarchy", []),
        "nutriscore": product_data.get("nutriscore_grade"),
        "nova_group": product_data.get("nova_group"),
        
        # Key Nutriments (per 100g)
        "nutriments": {
            "sugars_100g": nutriments.get("sugars_100g"),
            "salt_100g": nutriments.get("salt_100g"),
            "fat_100g": nutriments.get("fat_100g"),
            "saturated_fat_100g": nutriments.get("saturated-fat_100g"),
            "energy_kcal_100g": nutriments.get("energy-kcal_100g")
        },
        
        # Dietary & Lifestyle
        "analysis_tags": product_data.get("ingredients_analysis_tags", [])
    }
    
    return useful_data