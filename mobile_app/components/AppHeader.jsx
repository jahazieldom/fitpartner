import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { layout, typography, components, spacing, colors } from "@/styles";

export default function AppHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Image
          source={require("../assets/images/m.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Notifications")}
        accessibilityLabel="Ir a notificaciones"
      >
        <MaterialIcons name="notifications" size={23} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  button: {
    padding: 8,
  },
});
