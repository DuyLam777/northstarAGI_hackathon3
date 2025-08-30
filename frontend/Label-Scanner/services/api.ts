import axios from "axios";

const API_BASE_URL = "http://192.168.124.124:8000"; // Replace with your actual API URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for file uploads
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const uploadBloodTest = async (imageUri: string): Promise<any> => {
  try {
    // Create FormData object
    const formData = new FormData();

    // Get file info from URI
    const filename = imageUri.split("/").pop() || "blood_test.png";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/png";

    // Append file to FormData
    formData.append("file", {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    console.log("Uploading blood test image...");

    // Make the API call
    const response = await apiClient.post("/uploadfile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Blood test upload successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Blood test upload failed:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        throw new Error(
          `Upload failed: ${error.response.data?.message || error.response.statusText}`,
        );
      } else if (error.request) {
        // Network error
        throw new Error("Network error: Please check your internet connection");
      }
    }

    throw new Error("Upload failed: Please try again");
  }
};

// Alternative implementation using fetch (if you prefer)
export const uploadBloodTestFetch = async (imageUri: string): Promise<any> => {
  try {
    const formData = new FormData();

    const filename = imageUri.split("/").pop() || "blood_test.png";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/png";

    formData.append("file", {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    const response = await fetch(`${API_BASE_URL}/uploadfile/`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Blood test upload failed:", error);
    throw error;
  }
};

// For barcode analysis
export const analyzeBarcodeImage = async (
  imageUri: string,
): Promise<{
  healthy: boolean;
  reasoning: string;
  recommendation: string;
}> => {
  try {
    const formData = new FormData();

    const filename = imageUri.split("/").pop() || "barcode.png";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/png";

    formData.append("file", {
      uri: imageUri,
      type: type,
      name: filename,
    } as any);

    console.log("Analyzing barcode image...");

    // Using the same uploadfile endpoint for barcode analysis
    // You might want to use a different endpoint like '/analyze-barcode/' if your backend supports it
    const response = await apiClient.post("/uploadfile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Barcode analysis successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Barcode analysis failed:", error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Analysis failed: ${error.response.data?.message || error.response.statusText}`,
        );
      } else if (error.request) {
        throw new Error("Network error: Please check your internet connection");
      }
    }

    throw new Error("Analysis failed: Please try again");
  }
};
