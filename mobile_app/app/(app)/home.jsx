import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { getDashboard } from "@/services/user";
import { useRouter } from "expo-router";
import { layout, typography, components, spacing } from "../../styles";

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const [company, setCompany] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [plans, setPlans] = useState([])
  const router = useRouter();

  const handleLogout = () => {
    logout(router);
  };

  const setHomeInfo = async () => {
    let dashboard = await getDashboard()
    
    setPlans(dashboard.plans)
    setCompany(dashboard.company_info)
    setCurrentPlan(dashboard.current_plan)
  }
  
  useEffect(() => {
    setHomeInfo()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muvon</Text>
      <Text style={styles.text}>
        {user?.first_name ? `Hola, ${user.first_name}!` : "Usuario sin nombre"}
      </Text>

      { company && 
      <Text style={styles.text}>
        {company.company_name}
      </Text>
      }

      {!Boolean(currentPlan) && 
      <>
      <Text style={styles.text}>
        Actualmente no cuentas con un plan activo.
      </Text>
      
        { plans.map(plan => (
          <View style={[components.card, { marginTop: spacing.md }]} key={`plan-${plan.id}`}>
            <Text style={components.cardTitle}>{plan.name}</Text>
            <Text style={components.cardContent}>{plan.price}</Text>
          </View>
        ))}
      </>
      }

      <Button title="Cerrar sesión" onPress={handleLogout} />
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
