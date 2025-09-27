import { View, Text, StyleSheet, Button, SafeAreaView } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import ClientPlanCard from "@/components/ClientPlanCard";
import TitleCompanyName from "@/components/TitleCompanyName";
import { getDashboard } from "@/services/user";
import { colors, spacing, layout } from "@/styles";
import CustomText from '@/components/CustomText';

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  const setInfo = async () => {
    try {
      const dashboard = await getDashboard();
      setCompany(dashboard.company_info);
      setCurrentPlan(dashboard.current_plan);
      console.log("dashboard.current_plan", dashboard.current_plan);
    } catch (error) {
      console.error("Error al obtener el dashboard:", error);
    }
  };

  // Se ejecuta cada vez que la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      setInfo();
    }, [])
  );

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <>
    { Boolean(user) &&
      <SafeAreaView>
        <TitleCompanyName />

        <View style={layout.container}>
          <CustomText>Nombre completo: {user.first_name} {user.last_name}</CustomText>
          <CustomText>Email: {user.email}</CustomText>
          <CustomText>Último inicio de sesión: {user.last_login}</CustomText>

          <ClientPlanCard planInfo={currentPlan} />

          <Button title="Cerrar sesión" onPress={handleLogout} />
        </View>
      </SafeAreaView>
    }
    </>
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
