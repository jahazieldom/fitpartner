import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Linking, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import {getClasses} from "@/services/classes";
import { layout, typography, components, spacing } from "@/styles";
import { useLocalSearchParams } from "expo-router";

export default function PlanPaymentScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const { plan, checkoutUrl } = useLocalSearchParams();

  const [planObj, setPlanObj] = useState(null);

  useEffect(() => {
    if (plan) {
      try {
        const parsed = JSON.parse(plan);
        setPlanObj(parsed);
      } catch (e) {
        console.error("Error al parsear plan:", e);
        setPlanObj(null);
      }
    }
  }, [plan]);

  useEffect(() => {
    if (checkoutUrl){
        Linking.openURL(checkoutUrl).catch((err) =>
          console.error("No se pudo abrir el navegador:", err)
        );
    }
  }, [checkoutUrl]);


  useFocusEffect(
    React.useCallback(() => {
        console.log('Componente enfocado');
        // Aquí va el código que quieres ejecutar al entrar o regresar

        return () => {
        console.log('Componente desenfocado');
        };
    }, [])
    );


  return (
    <View style={styles.container}>
        { Boolean(planObj) && 
        <View>
            <Text>Plan {planObj.name}</Text>
            <View style={{ flex:1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        </View>
        }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
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
