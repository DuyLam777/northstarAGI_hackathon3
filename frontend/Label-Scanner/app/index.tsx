import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (username.trim()) {
      // You can store username in context or AsyncStorage here
      router.push("/user");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 16 }]}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 20) + 80,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="nutrition" size={50} color="#059669" />
          </View>
          <Text style={styles.heroTitle}>Smart Health Scanner</Text>
          <Text style={styles.heroSubtitle}>
            Personalized food recommendations based on your blood test results
          </Text>
        </View>

        {/* How It Works Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔬 How It Works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Upload Blood Test</Text>
                <Text style={styles.stepDescription}>
                  Share your recent blood test results
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Scan Food Products</Text>
                <Text style={styles.stepDescription}>
                  Use barcode scanner on any food item
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Recommendations</Text>
                <Text style={styles.stepDescription}>
                  Receive personalized health advice
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ Features</Text>
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Ionicons name="medical" size={20} color="#3b82f6" />
              <Text style={styles.featureText}>Blood test analysis</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="barcode" size={20} color="#3b82f6" />
              <Text style={styles.featureText}>Barcode scanning</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="restaurant" size={20} color="#3b82f6" />
              <Text style={styles.featureText}>Food compatibility check</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="heart" size={20} color="#3b82f6" />
              <Text style={styles.featureText}>Health recommendations</Text>
            </View>
          </View>
        </View>

        {/* Get Started Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Get Started</Text>
          <Text style={styles.label}>Enter your name to begin:</Text>

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Your name"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[styles.button, !username.trim() && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!username.trim()}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Start Your Health Journey</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer Card */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle" size={20} color="#f59e0b" />
          <Text style={styles.disclaimerText}>
            This app provides general guidance only. Always consult healthcare
            professionals for medical advice.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    backgroundColor: "#dcfce7",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 24,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    backgroundColor: "#3b82f6",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  featureList: {
    gap: 12,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#374151",
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9fafb",
  },
  button: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimerCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  disclaimerText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
    flex: 1,
  },
});
