from fastapi import FastAPI, HTTPException, File, UploadFile
import httpx
import io
from PIL import Image
from pyzbar.pyzbar import decode

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
@app.post("/scan/barcode")
async def scan_barcode_image(image: UploadFile = File(...)):
    # 1. Read the image file sent by the user
    image_bytes = await image.read()
    
    # 2. Use Pillow to open the image from the bytes
    pil_image = Image.open(io.BytesIO(image_bytes))
    
    # 3. Use pyzbar to decode the barcode from the image
    barcodes = decode(pil_image)
    
    if not barcodes:
        raise HTTPException(status_code=400, detail="No barcode found in the uploaded image.")
        
    # 4. Extract the barcode string from the first detected barcode
    # The data is in bytes, so we decode it to a UTF-8 string
    barcode_data = barcodes[0].data.decode('utf-8')
    
    # --- From here, the logic is the same as before ---
    
    product_data = await get_product_data(barcode_data)
    
    if not product_data:
        raise HTTPException(status_code=404, detail="Product data is empty for the scanned barcode.")

    nutriments = product_data.get("nutriments", {})
    
    useful_data = {
        "barcode": product_data.get("code"),
        "product_name": product_data.get("product_name_en") or product_data.get("product_name"),
        "brands": product_data.get("brands"),
        "image_url": product_data.get("image_front_url"),
        "ingredients": product_data.get("ingredients_text_en") or product_data.get("ingredients_text"),
        "allergens": product_data.get("allergens_hierarchy", []),
        "nutriscore": product_data.get("nutriscore_grade"),
        "nova_group": product_data.get("nova_group"),
        "nutriments": {
            "sugars_100g": nutriments.get("sugars_100g"),
            "salt_100g": nutriments.get("salt_100g"),
            "fat_100g": nutriments.get("fat_100g"),
            "saturated_fat_100g": nutriments.get("saturated-fat_100g"),
            "energy_kcal_100g": nutriments.get("energy-kcal_100g")
        },
        "analysis_tags": product_data.get("ingredients_analysis_tags", [])
    }
    
    return useful_data