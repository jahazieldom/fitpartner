import { View, Text, StyleSheet, Button } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import ClientPlanCard from "@/components/ClientPlanCard";

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <ClientPlanCard planInfo={{
          "name": "Plan Mensual",
          "purchase_date": "2025-08-10",
          "first_use_date": null,
          "is_active": true,
          "remaining_sessions": 25,
          "expiration_date": "2025-09-10",
          "plan_expiry_description": "Plan Mensual (expira en 30 días)",
          "expiration_label": "1 mes desde la fecha de compra"
      }} />

      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
