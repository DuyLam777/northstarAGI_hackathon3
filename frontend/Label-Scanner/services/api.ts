import axios from "axios";

const API_BASE_URL = "http://192.168.124.124:8000"; // Replace with your actual API URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for file uploads
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
          `Upload failed: ${error.response.data?.detail || error.response.statusText}`,
        );
      } else if (error.request) {
        // Network error
        throw new Error("Network error: Please check your internet connection");
      }
    }

    throw new Error("Upload failed: Please try again");
  }
};
