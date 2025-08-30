import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { uploadImage } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function UserPage() {
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
      Alert.alert("Success", "Blood test image uploaded successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to upload blood test image");
    }
    setUploading(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.card}>
        <View style={styles.headerIcon}>
          <Ionicons name="medical" size={40} color="#dc2626" />
        </View>
        <Text style={styles.title}>User blood test</Text>
        <Text style={styles.subtitle}>
          We need a clear image of your blood test results to provide accurate
          analysis.
        </Text>
      </View>

      {/* Instructions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Instructions</Text>
        <View style={styles.instructionList}>
          <Text style={styles.instructionItem}>• Ensure good lighting</Text>
          <Text style={styles.instructionItem}>• Keep the document flat</Text>
          <Text style={styles.instructionItem}>• Include all test values</Text>
          <Text style={styles.instructionItem}>• Avoid shadows and glare</Text>
        </View>
      </View>

      {/* Image Preview Card */}
      {image && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📸 Preview</Text>
          <Image source={{ uri: image }} style={styles.image} />
          <Text style={styles.previewText}>
            Blood test image ready for analysis
          </Text>
        </View>
      )}

      {/* Upload Actions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📤 Upload Options</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
            <Ionicons
              name="images"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
            <Ionicons
              name="camera"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          {image && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.uploadButton]}
              onPress={handleUpload}
              disabled={uploading}
            >
              <Ionicons
                name={uploading ? "cloud-upload" : "checkmark-circle"}
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {uploading ? "Uploading..." : "Analyze Blood Test"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Navigation Card */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/main")}
        >
          <Ionicons
            name="arrow-forward"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Start scanning</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIcon: {
    alignSelf: "center",
    marginBottom: 12,
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  instructionList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  previewText: {
    textAlign: "center",
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButton: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
  },
  navButton: {
    backgroundColor: "#6366f1",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
