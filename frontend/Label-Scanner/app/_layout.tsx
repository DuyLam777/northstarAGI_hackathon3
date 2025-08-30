// _layout.tsx
import React from "react";
import { Drawer } from "expo-router/drawer";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    UncleSam: require("../assets/UncleSam.otf"),
  });

  if (!fontsLoaded) {
    return null; // Show splash until fonts load
  }

  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="nutrition"
                size={24}
                color="#059669"
                style={styles.logoIcon}
              />
              <Text style={styles.headerTitle}>Smart Health Scanner</Text>
            </View>
          </View>
        ),
        headerTitleAlign: "center",
        headerLeft: () => (
          <View style={styles.burgerContainer}>
            <TouchableOpacity
              style={styles.burgerButton}
              onPress={() => navigation.toggleDrawer()}
            >
              <Ionicons name="menu" size={28} color="#374151" />
            </TouchableOpacity>
          </View>
        ),
        headerStyle: {
          backgroundColor: "#ffffff",
          elevation: 4,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
        },
        headerTintColor: "#374151",
      })}
    >
      {/* Home page */}
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Blood Test Upload page */}
      <Drawer.Screen
        name="user"
        options={{
          title: "User's Blood Test",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="medical" size={size} color={color} />
          ),
        }}
      />

      {/* Food Scanner page */}
      <Drawer.Screen
        name="main"
        options={{
          title: "Food Scanner",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="barcode" size={size} color={color} />
          ),
          drawerItemStyle: { display: "none" }, // Keep hidden as requested
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: "UncleSam",
    fontSize: 20, // Slightly smaller to accommodate icon
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  burgerContainer: {
    marginLeft: 16,
    marginRight: 8,
  },
  burgerButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
