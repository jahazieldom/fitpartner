import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, RefreshControl, Alert, FlatList } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { getDashboard, createCheckoutLink } from "@/services/user";
import { formatCurrency } from "@/utils/functions";
import { useRouter } from "expo-router";
import { layout, typography, components, spacing } from "@/styles";
import {HelloWave} from "@/components/HelloWave"
import ClassCard from "@/components/ClassCard"
import { Linking } from "react-native"


export default function HomeScreen() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [plans, setPlans] = useState([])
  const [classes, setClasses] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const {setCompanies} = useAuth(); 

  const router = useRouter();

  const setHomeInfo = async () => {
    let dashboard = await getDashboard()
    setCompanies(dashboard.user.companies)
    setPlans(dashboard.plans)
    setCompany(dashboard.company_info)
    setCurrentPlan(dashboard.current_plan)
    setClasses(dashboard.classes || [])
  }
  
  useEffect(() => {
    setHomeInfo()
  }, [])

  const handleCheckoutPlan = async (plan) => {
    let res = await createCheckoutLink({plan_id: plan.id})

    if (res?.status == "error") {
      Alert.alert(
        "Error",
        res.message || "Ocurrió un error al generar el enlace de pago."
      );
      return;
    }
    
    if (res?.url) {
      router.push({
        pathname: "/home/plan_payment",
        params: { 
          plan: JSON.stringify(plan),
          checkoutUrl: res.url,
        }, // Pasamos plan serializado porque params debe ser string o primitivo
      });
      // Linking.openURL(res.url).catch((err) =>
      //   console.error("No se pudo abrir el navegador:", err)
      // );
    } 
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await setHomeInfo();
    setRefreshing(false);
  }, []);
  
  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.container}>
        { company && 
        <View style={{padding: spacing.lg}}>
          <Text style={styles.title}>{company.name}</Text>
        </View>
        }
        <Text style={styles.text}>
          {user?.first_name ? `Hola ${user.first_name}!` : "Bienvenido"} <HelloWave />
        </Text>


        {!Boolean(currentPlan) && 
        <>
        <Text style={styles.text}>
          Actualmente no cuentas con un plan activo.
        </Text>
        
          { plans.map(plan => (
            <View style={[components.card]} key={`plan-${plan.id}`}>
              <Text style={components.cardTitle}>{plan.name}</Text>
              <Text style={{...components.cardContent}}>
                <View style={{...layout.fullWidth, paddingVertical: 5}}>
                  <Text style={{textAlign: 'right'}}>${formatCurrency(plan.price)}</Text>
                </View>
                <View style={{...layout.fullWidth, paddingVertical: 2}}>
                  <Text>{plan.description}</Text>
                  <Text>Vigencia: {plan.expiration_label}</Text>
                </View>
                {/* <View style={{...layout.fullWidth, paddingVertical: 5}}>
                  <Text>{JSON.stringify(plan)}</Text>
                </View> */}
                <View style={layout.fullWidth}>
                {company?.stripe_enabled && 
                <TouchableOpacity style={[components.button]} onPress={() => {handleCheckoutPlan(plan)}}>
                  <Text style={components.buttonText}>Contratar</Text>
                </TouchableOpacity>
                }
                </View>
              </Text>
            </View>
          ))}
        </>
        }

        {Boolean(classes.length) && 
        <View>
          <Text style={styles.text}>Clases</Text>
           <ScrollView
            horizontal
            // showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ height: 240,  alignItems: 'center'}}
          >
            {classes.map(item => (
              <ClassCard
                key={`class-${item.id}`}
                imageUri="https://example.com/imagen.jpg"
                name={item.name}
                description={item.description}
                days={item.weekdays}
              />
            ))}
          </ScrollView>
        </View>
        }

      </View>
    </ScrollView>
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
