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
import { uploadBloodTest } from "../services/api"; // Import the new API function
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserPage() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to select your blood test image!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8, // Slightly lower quality for faster upload
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setUploadSuccess(false); // Reset success state
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to take a photo of your blood test!",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setUploadSuccess(false); // Reset success state
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert(
        "No Image",
        "Please select or take a photo of your blood test first.",
      );
      return;
    }

    setUploading(true);

    try {
      console.log("Starting blood test upload...");
      const response = await uploadBloodTest(image);

      console.log("Upload response:", response);
      setUploadSuccess(true);

      Alert.alert(
        "Success! 🎉",
        "Your blood test has been uploaded and analyzed successfully! You can now scan food products to get personalized recommendations.",
        [
          {
            text: "Start Scanning",
            onPress: () => router.push("/main"),
            style: "default",
          },
          {
            text: "Stay Here",
            style: "cancel",
          },
        ],
      );
    } catch (error) {
      console.error("Upload error:", error);

      Alert.alert(
        "Upload Failed",
        error instanceof Error
          ? error.message
          : "Failed to upload blood test. Please check your internet connection and try again.",
        [
          {
            text: "Retry",
            onPress: handleUpload,
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20) + 60,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <View style={styles.card}>
        <View style={styles.headerIcon}>
          <Ionicons name="medical" size={40} color="#dc2626" />
        </View>
        <Text style={styles.title}>Blood Test Analysis</Text>
        <Text style={styles.subtitle}>
          Upload a clear photo of your blood test results for personalized food
          recommendations
        </Text>
      </View>

      {/* Upload Status Card */}
      {uploadSuccess && (
        <View style={[styles.card, styles.successCard]}>
          <Ionicons name="checkmark-circle" size={32} color="#059669" />
          <Text style={styles.successTitle}>
            Blood Test Uploaded Successfully! ✅
          </Text>
          <Text style={styles.successText}>
            Your blood test has been analyzed. You can now scan food products to
            get personalized health recommendations.
          </Text>
        </View>
      )}

      {/* Instructions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Instructions</Text>
        <View style={styles.instructionList}>
          <Text style={styles.instructionItem}>
            • Ensure good lighting and clear visibility
          </Text>
          <Text style={styles.instructionItem}>
            • Keep the document flat and avoid shadows
          </Text>
          <Text style={styles.instructionItem}>
            • Include all test values and reference ranges
          </Text>
          <Text style={styles.instructionItem}>
            • Make sure text is readable and not blurry
          </Text>
        </View>
      </View>

      {/* Image Preview Card */}
      {image && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📸 Preview</Text>
          <Image source={{ uri: image }} style={styles.image} />
          <Text style={styles.previewText}>
            {uploadSuccess
              ? "✅ Blood test successfully uploaded and analyzed!"
              : "Blood test image ready for upload"}
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
            <Text style={styles.buttonText}>Select from Gallery</Text>
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

          {image && !uploadSuccess && (
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
                {uploading ? "Uploading Blood Test..." : "Upload & Analyze"}
              </Text>
            </TouchableOpacity>
          )}

          {uploadSuccess && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.scanButton]}
              onPress={() => router.push("/main")}
            >
              <Ionicons
                name="barcode"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                Start Scanning Food Products
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress Card */}
      {uploading && (
        <View style={styles.card}>
          <View style={styles.progressContainer}>
            <Ionicons name="cloud-upload" size={32} color="#3b82f6" />
            <Text style={styles.progressTitle}>Uploading Blood Test...</Text>
            <Text style={styles.progressText}>
              Please wait while we upload and analyze your blood test results.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
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
  successCard: {
    backgroundColor: "#f0f9f4",
    borderWidth: 2,
    borderColor: "#059669",
    alignItems: "center",
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
  successTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#059669",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
    lineHeight: 20,
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
    resizeMode: "contain", // Changed from default to maintain aspect ratio without cropping
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
  scanButton: {
    backgroundColor: "#7c3aed",
    shadowColor: "#7c3aed",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    alignItems: "center",
    padding: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3b82f6",
    marginTop: 12,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
