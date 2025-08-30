from fastapi import FastAPI, HTTPException, File, UploadFile
import httpx
import io
from PIL import Image
from pyzbar.pyzbar import decode
import cv2
import numpy as np

app = FastAPI()

# This helper function remains the same
async def get_product_data(barcode: str):
    api_url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, auth=('off', 'off'))
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Product not found or API error.")
            
        data = response.json()
        
        if data.get("status") == 0:
            raise HTTPException(status_code=404, detail=f"Product with barcode {barcode} not found.")
            
        return data.get("product")

# NEW ENDPOINT: This one accepts an image file upload
@app.post("/scan")
async def scan_barcode_image(image: UploadFile = File(...)):
    barcode_data = await decode_image(image)

    product_data = await get_product_data(barcode_data)

    print(barcode_data)
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Product data is empty for the scanned barcode.")

    nutriments = product_data.get("nutriments", {})
    
    useful_data = {
        "product_name": product_data.get("product_name_en") or product_data.get("product_name"),
        "brands": product_data.get("brands"),
        "image_url": product_data.get("image_front_url"),
        "ingredients": product_data.get("ingredients_text_en") or product_data.get("ingredients_text"),
        "nutriscore": product_data.get("nutriscore_grade"),
        "nutriments": {
            "sugars_100g": nutriments.get("sugars_100g"),
            "salt_100g": nutriments.get("salt_100g"),
            "fat_100g": nutriments.get("fat_100g"),
            "saturated_fat_100g": nutriments.get("saturated-fat_100g"),
            "energy_kcal_100g": nutriments.get("energy-kcal_100g")
        }
    }
    
    return useful_data

async def decode_image(image: UploadFile = File(...)):
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
        raise HTTPException(status_code=400, detail="No barcode found after all processing attempts.")

    print(f"✅ Success! Found barcode: {barcodes[0].data.decode('utf-8')}")
    barcode_data = barcodes[0].data.decode('utf-8')

    # ... The rest of your code to fetch from Open Food Facts and return data ...
    
    return barcode_data