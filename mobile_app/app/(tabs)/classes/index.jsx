import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, FlatList, RefreshControl, SafeAreaView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { colors, components, layout } from "@/styles";
import { getCurrentCompany } from "@/utils/storage";
import TitleCompanyName from "@/components/TitleCompanyName";
import { getReservations } from "@/services/user";
import CustomText from '@/components/CustomText';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function reservationsScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [currentCompany, setCurrentCompany] = useState();

  const loadreservations = async () => {
    setLoading(true);
    try {
      const response = await getReservations();
      setReservations(response.results);
    } catch (error) {
      console.error("Error loading reservations:", error);
    }
    setLoading(false);
  };

  const loadCompany = async () => {
    const company = await getCurrentCompany();
    setCurrentCompany(company);
  };

  useEffect(() => {
    loadCompany();
    loadreservations();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadreservations();
    setRefreshing(false);
  }, []);


  return (

    <SafeAreaView style={{ flex: 1 }}>
      <TitleCompanyName />
      <View style={{ padding: 10}}>
        <FlatList
          data={reservations}
          keyExtractor={(item) => `class-${item.id}`}
          renderItem={({ item }) => {
            const isCancelled = Boolean(item.cancelled_at)
            const checkedIn = Boolean(item.checked_in)
            
            let labelText 
            let icon = <FontAwesome name="calendar-plus-o" size={20} color={colors.blue} />

            switch (item.status) {
              case "checked_in":
                icon = <FontAwesome name="calendar-check-o" size={20} color={colors.success} />
                labelText = "Asistencia"
                break;
              case "cancelled":
                icon = <FontAwesome name="calendar-times-o" size={20} color={colors.danger} />
                labelText = "Reservación cancelada"
                break;
            }

            return (
            <View style={{...layout.row, ...components.card, padding: 8, marginVertical: 0, marginBottom: 5}}>
              <View style={{...layout.column, padding: 10}}>
                <CustomText>
                  {icon}
                </CustomText>
              </View>
              <View style={{...layout.column, padding: 3}}>
                <CustomText>{item.session?.category?.name}</CustomText>
                <CustomText>ID: {item.id}</CustomText>
                <CustomText>Fecha: {item.session.date}</CustomText>
                <CustomText>Hora: {item.session.start_time}</CustomText>
                {labelText &&
                <CustomText>{labelText}</CustomText>
                }
              </View>
              {/* <CustomText>{JSON.stringify(item)}</CustomText> */}
            </View>
            )
          }}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={() => !loading && (
            <Text style={{ textAlign: "center", marginTop: 20 }}>No hay clases disponibles</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
  },
  description: {
    fontSize: 13,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 12,
    margin: 2,
    // backgroundColor: colors.primary + "33", // ligero fondo transparente con color primary
  },
  dayText: {
    color: colors.primary,
    fontSize: 12,
  },
  noDays: {
    fontSize: 12,
    color: '#999',
  },
  container: {
    paddingBottom: 20,
  },
});
