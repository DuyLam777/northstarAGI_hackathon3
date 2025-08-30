import base64
import io
import json
import os
import shutil

import cv2
import httpx
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from file_processing import process_file
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel
from pyzbar.pyzbar import decode

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()


# This helper function remains the same
async def get_product_data(barcode: str):
    api_url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, auth=("off", "off"))

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Product not found or API error.",
            )

        data = response.json()

        if data.get("status") == 0:
            raise HTTPException(
                status_code=404, detail=f"Product with barcode {barcode} not found."
            )

        return data.get("product")


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


# --- Mock storage for lab results (replace with session/db later) ---
user_lab_results = {}


class FoodData(BaseModel):
    product_name: str
    ingredients: str = None
    nutri_score: str = None
    nutrients: dict = None


@app.post("/analyze-food")
async def analyze_food(food_data: FoodData):
    b64_file_path = "../bloodwork_converted/bloodwork_converted.b64"
    if not os.path.exists(b64_file_path):
        raise HTTPException(status_code=400, detail="No bloodwork uploaded yet")

    try:
        with open(b64_file_path, "r") as f:
            base64_str = f.read().strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read .b64 file: {e}")

    try:
        # Decode base64 string to bytes
        image_data = base64.b64decode(base64_str)
        # Create PIL Image from bytes
        image = Image.open(io.BytesIO(image_data))
        user_lab_results["latest"] = image
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to decode image from .b64: {e}"
        )

    # Prepare food context
    food_json_str = json.dumps(food_data.dict(), indent=2)

    # Define system instruction
    system_instruction = """
You are a personalized AI nutritionist. You analyze a person's blood test results and food items to give a health suitability score from 1 to 5:
- 5: Excellent choice based on their labs
- 4: Good, minor concerns
- 3: Neutral or mixed impact
- 2: Not ideal, potential risk
- 1: Avoid – conflicts with health markers

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
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(system_instruction=system_instruction),
            contents=[image, f"Here is the food item to evaluate:\n{food_json_str}"],
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
                detail=f"Failed to parse Gemini JSON: {e}. Raw output: {text}",
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


@app.post("/scan")
async def scan_barcode_image(image: UploadFile = File(...)):
    try:
        print(f"Received image file: {image.filename}")

        # Decode the barcode from the image
        barcode_data = await decode_image(image)
        print(f"Decoded barcode: {barcode_data}")

        # Get product data from Open Food Facts
        product_data = await get_product_data(barcode_data)

        if not product_data:
            raise HTTPException(
                status_code=404, detail="Product data is empty for the scanned barcode."
            )

        # Extract nutriments safely
        nutriments = product_data.get("nutriments", {})

        # Create FoodData object with correct field names
        food_data_obj = FoodData(
            product_name=product_data.get("product_name_en")
            or product_data.get("product_name", "Unknown Product"),
            ingredients=product_data.get("ingredients_text_en")
            or product_data.get("ingredients_text"),
            nutri_score=product_data.get("nutriscore_grade"),
            nutrients={
                "sugars_100g": nutriments.get("sugars_100g"),
                "salt_100g": nutriments.get("salt_100g"),
                "fat_100g": nutriments.get("fat_100g"),
                "saturated_fat_100g": nutriments.get("saturated-fat_100g"),
                "energy_kcal_100g": nutriments.get("energy-kcal_100g"),
            },
        )

        print(f"Created FoodData object: {food_data_obj}")

        # Analyze the food
        analyze_food_response = await analyze_food(food_data_obj)

        # Add additional product info to response
        response_data = {
            **analyze_food_response,
            "product_info": {
                "name": food_data_obj.product_name,
                "brands": product_data.get("brands"),
                "image_url": product_data.get("image_front_url"),
                "nutri_score": food_data_obj.nutri_score,
                "barcode": barcode_data,
            },
        }

        return response_data

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error in scan_barcode_image: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


async def decode_image(image: UploadFile = File(...)):
    try:
        # Read the image bytes
        image_bytes = await image.read()
        np_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        barcodes = []

        # --- The Decoding Pipeline ---

        # 1. First attempt on the simple grayscale image
        print("Attempt 1: Decoding raw grayscale image...")
        barcodes = decode(gray)

        # 2. If it fails, try with a dilated image (helps thin lines)
        if not barcodes:
            print("Attempt 2: Decoding dilated image...")
            kernel = np.ones((3, 3), np.uint8)
            dilated = cv2.dilate(gray, kernel, iterations=1)
            barcodes = decode(dilated)

        # 3. If it still fails, try with an eroded image (helps blurry/merged lines)
        if not barcodes:
            print("Attempt 3: Decoding eroded image...")
            kernel = np.ones((3, 3), np.uint8)
            eroded = cv2.erode(gray, kernel, iterations=1)
            barcodes = decode(eroded)

        # 4. If all attempts fail, then raise the error
        if not barcodes:
            raise HTTPException(
                status_code=400,
                detail="No barcode found after all processing attempts.",
            )

        print(f"✅ Success! Found barcode: {barcodes[0].data.decode('utf-8')}")
        barcode_data = barcodes[0].data.decode("utf-8")

        return barcode_data

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error in decode_image: {e}")
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")
