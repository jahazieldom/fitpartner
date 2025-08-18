import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Octicons from '@expo/vector-icons/Octicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
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

      <View style={[layout.row, layout.gap]}>
        <TouchableOpacity
          style={styles.button}
          // onPress={() => navigation.navigate("Notifications")}
          accessibilityLabel="Ir a notificaciones"
        >
          <SimpleLineIcons name="bubble" size={18} color={'white'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          // onPress={() => navigation.navigate("Notifications")}
          accessibilityLabel="Ir a notificaciones"
        >
          <SimpleLineIcons name="bell" size={18} color={'white'} />
        </TouchableOpacity>
      </View>
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
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 35,
    height: 35,
  },
  button: {
    padding: 8,
  },
});
