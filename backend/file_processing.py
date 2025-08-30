import base64
import magic
import os
from PIL import Image
from PyPDF2 import PdfReader
import io

def process_file(file_path):
    print(f"Processing file: {file_path}")
    """
    Processes an image or PDF file, converts it to a Base64 string,
    and saves it to the 'bloodwork_converted/' directory.

    Args:
        file_path (str): The path to the file to process.

    Returns:
        str: The path to the saved Base64 file.
    """
    try:
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)
        print(f"Detected file type: {file_type}")

        base64_string = ""
        
        if "image" in file_type:
            print("Processing as image.")
            with open(file_path, "rb") as f:
                base64_string = base64.b64encode(f.read()).decode("utf-8")
        elif "pdf" in file_type:
            print("Processing as PDF.")
            with open(file_path, "rb") as f:
                base64_string = base64.b64encode(f.read()).decode("utf-8")

        if base64_string:
            file_name = 'bloodwork_converted'
            output_path = os.path.join("bloodwork_converted", f"{file_name}.b64")
            print(f"Saving Base64 to: {output_path}")
            with open(output_path, "w") as f:
                f.write(base64_string)
            return output_path
        else:
            print("Could not process file, empty base64 string.")
            return None
    except Exception as e:
        print(f"An error occurred in file processing: {e}")
        return None
