import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { uploadImage } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

interface AnalysisResult {
  healthy: boolean;
  reasoning: string;
  recommendation: string;
}

export default function MainPage() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [analyzing, setAnalyzing] = useState(false);
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
      setAnalysisResult(null); // Reset previous results
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
      setAnalysisResult(null); // Reset previous results
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setAnalyzing(true);
    try {
      const response = await uploadImage(image);
      // Assuming the API returns the analysis result
      setAnalysisResult(response);
      Alert.alert("Success", "Product analyzed successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to analyze product");
    }
    setAnalyzing(false);
  };

  const resetScan = () => {
    setImage(null);
    setAnalysisResult(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.card}>
        <View style={styles.headerIcon}>
          <Ionicons name="barcode" size={40} color="#3b82f6" />
        </View>
        <Text style={styles.title}>Food Product Scanner</Text>
        <Text style={styles.subtitle}>
          Scan or photograph a product barcode to get personalized health
          recommendations
        </Text>
      </View>

      {/* Instructions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Scanning Tips</Text>
        <View style={styles.instructionList}>
          <Text style={styles.instructionItem}>
            • Ensure barcode is clearly visible
          </Text>
          <Text style={styles.instructionItem}>• Use good lighting</Text>
          <Text style={styles.instructionItem}>• Keep camera steady</Text>
          <Text style={styles.instructionItem}>
            • Include entire barcode in frame
          </Text>
        </View>
      </View>

      {/* Image Capture Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Capture Barcode</Text>

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
              <Ionicons name="refresh" size={20} color="#6b7280" />
              <Text style={styles.resetText}>Scan Another Product</Text>
            </TouchableOpacity>
          </View>
        )}

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
            <Text style={styles.buttonText}>Scan Barcode</Text>
          </TouchableOpacity>

          {image && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.analyzeButton]}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={styles.buttonIcon}
                />
              ) : (
                <Ionicons
                  name="search"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
              )}
              <Text style={styles.buttonText}>
                {analyzing ? "Analyzing..." : "Analyze Product"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Analysis Results Card */}
      {analysisResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧬 Health Analysis Results</Text>

          {/* Health Status with GIF */}
          <View style={styles.resultContainer}>
            <Image
              source={{
                uri: analysisResult.healthy
                  ? "https://tenor.com/view/005861-gif-13926462904635032157"
                  : "https://tenor.com/view/horse-tongue-no-shake-head-shakes-head-gif-266031360104092246",
              }}
              style={styles.resultGif}
              resizeMode="contain"
            />

            <View
              style={[
                styles.healthStatus,
                analysisResult.healthy
                  ? styles.healthyStatus
                  : styles.unhealthyStatus,
              ]}
            >
              <Ionicons
                name={
                  analysisResult.healthy ? "checkmark-circle" : "close-circle"
                }
                size={24}
                color="white"
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {analysisResult.healthy
                  ? "✅ Good for You!"
                  : "❌ Not Recommended"}
              </Text>
            </View>
          </View>

          {/* Reasoning */}
          <View style={styles.reasoningContainer}>
            <Text style={styles.sectionTitle}>🔍 Analysis</Text>
            <Text style={styles.reasoningText}>{analysisResult.reasoning}</Text>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationContainer}>
            <Text style={styles.sectionTitle}>💡 Recommendations</Text>
            <Text style={styles.recommendationText}>
              {analysisResult.recommendation}
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
    backgroundColor: "#dbeafe",
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  resetText: {
    color: "#6b7280",
    fontSize: 14,
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
  analyzeButton: {
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
  resultContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultGif: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  healthStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  healthyStatus: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
  },
  unhealthyStatus: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  reasoningContainer: {
    marginBottom: 20,
  },
  recommendationContainer: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  recommendationText: {
    fontSize: 15,
    color: "#0c4a6e",
    lineHeight: 22,
    fontWeight: "500",
  },
});
