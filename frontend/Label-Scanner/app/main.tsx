import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { uploadImage } from "../services/api";

export default function MainPage() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    setUploading(true);
    try {
      await uploadImage(image);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    }
    setUploading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Page</Text>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            style={[styles.button, styles.uploadButton]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>
              {uploading ? "Uploading..." : "Upload Image"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push("/user")}
      >
        <Text style={styles.buttonText}>Go to User Page</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButton: {
    backgroundColor: "#28a745",
  },
  navButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
