import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image"; // Changed from react-native Image to expo-image
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { analyzeBarcodeImage } from "../services/api"; // Import the barcode analysis function
import { Ionicons } from "@expo/vector-icons";

interface AnalysisResult {
  healthy: boolean;
  reasoning: string;
  recommendation: string;
}

export default function MainPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to select your barcode image!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8, // Optimize for upload
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setAnalysisResult(null); // Reset previous results
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to scan the barcode!",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setAnalysisResult(null); // Reset previous results
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      Alert.alert(
        "No Image",
        "Please select or take a photo of the barcode first.",
      );
      return;
    }

    setAnalyzing(true);

    try {
      console.log("Starting barcode analysis...");
      const response = await analyzeBarcodeImage(image);

      console.log("Analysis response:", response);
      setAnalysisResult(response);

      Alert.alert(
        "Analysis Complete! 🔬",
        `Product ${response.healthy ? "is good" : "is not recommended"} for your health profile.`,
        [{ text: "View Details", style: "default" }],
      );
    } catch (error) {
      console.error("Analysis error:", error);

      Alert.alert(
        "Analysis Failed",
        error instanceof Error
          ? error.message
          : "Failed to analyze the product. Please check your internet connection and try again.",
        [
          {
            text: "Retry",
            onPress: handleAnalyze,
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScan = () => {
    setImage(null);
    setAnalysisResult(null);
  };

  // ========== TEMPORARY TEST FUNCTIONS - DELETE WHEN BACKEND IS READY ==========
  const simulateHealthyResult = () => {
    const mockHealthyResult: AnalysisResult = {
      healthy: true,
      reasoning:
        "This product contains high levels of omega-3 fatty acids and low sodium content, which aligns well with your blood test results showing elevated cholesterol levels. The product's nutritional profile suggests it can help improve your cardiovascular health.",
      recommendation:
        "This product is recommended for your health profile! Consider incorporating similar omega-3 rich foods into your diet. Pair with leafy greens for optimal nutrient absorption.",
    };

    setAnalysisResult(mockHealthyResult);
    Alert.alert("Test Result! 🧪", "Simulated healthy product response");
  };

  const simulateUnhealthyResult = () => {
    const mockUnhealthyResult: AnalysisResult = {
      healthy: false,
      reasoning:
        "This product is high in saturated fats and sodium, which could be problematic given your blood test results showing elevated LDL cholesterol and borderline high blood pressure. The sugar content may also impact your glucose levels.",
      recommendation:
        "We recommend avoiding this product. Instead, try foods rich in fiber and lean proteins. Consider alternatives like grilled chicken, quinoa, or fresh vegetables to better support your health goals.",
    };

    setAnalysisResult(mockUnhealthyResult);
    Alert.alert("Test Result! 🧪", "Simulated unhealthy product response");
  };
  // ========== END TEMPORARY TEST FUNCTIONS ==========

  // Get the local GIF asset
  const getGifSource = (healthy: boolean) => {
    if (healthy) {
      // Good/Yes GIF - horse nodding
      return require("../assets/horse-nodding.gif");
    } else {
      // Bad/No GIF - horse shaking head
      return require("../assets/horse-shaking.gif");
    }
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
          recommendations based on your blood test
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
          <Text style={styles.instructionItem}>
            • Make sure barcode is not blurry or damaged
          </Text>
        </View>
      </View>

      {/* Image Capture Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Capture Barcode</Text>

        {image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.image}
              contentFit="cover"
            />
            <TouchableOpacity style={styles.resetButton} onPress={resetScan}>
              <Ionicons name="refresh" size={20} color="#6b7280" />
              <Text style={styles.resetText}>Scan Another Product</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={pickImage}
            disabled={analyzing}
          >
            <Ionicons
              name="images"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={takePhoto}
            disabled={analyzing}
          >
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
                {analyzing ? "Analyzing Product..." : "Analyze Product"}
              </Text>
            </TouchableOpacity>
          )}

          {/* ========== TEMPORARY TEST BUTTONS - DELETE WHEN BACKEND IS READY ========== */}
          {image && (
            <View style={styles.testButtonsContainer}>
              <Text style={styles.testButtonsLabel}>
                🧪 Test Buttons (Remove Later)
              </Text>
              <View style={styles.testButtonsRow}>
                <TouchableOpacity
                  style={[styles.testButton, styles.testButtonHealthy]}
                  onPress={() => simulateHealthyResult()}
                  disabled={analyzing}
                >
                  <Text style={styles.testButtonText}>Test Healthy ✅</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.testButton, styles.testButtonUnhealthy]}
                  onPress={() => simulateUnhealthyResult()}
                  disabled={analyzing}
                >
                  <Text style={styles.testButtonText}>Test Unhealthy ❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* ========== END TEMPORARY TEST BUTTONS ========== */}
        </View>
      </View>

      {/* Analysis Progress Card */}
      {analyzing && (
        <View style={styles.card}>
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.progressTitle}>Analyzing Product...</Text>
            <Text style={styles.progressText}>
              Please wait while we analyze the barcode and check compatibility
              with your blood test results.
            </Text>
          </View>
        </View>
      )}

      {/* Analysis Results Card */}
      {analysisResult && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧬 Health Analysis Results</Text>

          {/* Health Status with Local GIF */}
          <View style={styles.resultContainer}>
            <Image
              source={getGifSource(analysisResult.healthy)}
              style={styles.resultGif}
              contentFit="contain"
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
                  ? "It's Good for You!"
                  : "Not Recommended"}
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

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.scanAnotherButton}
              onPress={resetScan}
            >
              <Ionicons
                name="barcode"
                size={20}
                color="#3b82f6"
                style={styles.buttonIcon}
              />
              <Text style={styles.scanAnotherText}>Scan Another Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateBloodTestButton}
              onPress={() => router.push("/user")}
            >
              <Ionicons
                name="medical"
                size={20}
                color="#059669"
                style={styles.buttonIcon}
              />
              <Text style={styles.updateBloodTestText}>Update Blood Test</Text>
            </TouchableOpacity>
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
    marginTop: 16,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultGif: {
    width: 150,
    height: 150,
    borderRadius: 12,
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
    marginBottom: 20,
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
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  scanAnotherButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#3b82f6",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scanAnotherText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  updateBloodTestButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#059669",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  updateBloodTestText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
  },

  // ========== TEMPORARY TEST BUTTON STYLES - DELETE WHEN BACKEND IS READY ==========
  testButtonsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  testButtonsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
    textAlign: "center",
    marginBottom: 12,
  },
  testButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  testButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonHealthy: {
    backgroundColor: "#059669",
  },
  testButtonUnhealthy: {
    backgroundColor: "#dc2626",
  },
  testButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // ========== END TEMPORARY TEST BUTTON STYLES ==========
});
