import axios from "axios";

const API_BASE_URL = "https://your-api-endpoint.com"; // Replace with your actual API URL

export const uploadImage = async (imageUri: string, username?: string) => {
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);

  if (username) {
    formData.append("username", username);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
