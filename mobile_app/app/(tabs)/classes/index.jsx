import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, FlatList, RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { getClasses } from "@/services/classes";
import { colors } from "@/styles";
import { getCurrentCompany } from "@/utils/storage";
import TitleCompanyName from "@/components/TitleCompanyName";

function ClassCard({ imageUri, name, description, days }) {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <Text style={styles.name}>{name}</Text>
        {Boolean(description) && 
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        }
        <View style={styles.daysContainer}>
          {days && days.length > 0 ? (
            days.map((day) => (
              <View key={day} style={styles.dayBadge}>
                <Text style={styles.dayText}>{dayNames[day]}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDays}>Sin días asignados</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ClassesScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState([]);
  const [currentCompany, setCurrentCompany] = useState();

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await getClasses();
      setClasses(response.results);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
    setLoading(false);
  };

  const loadCompany = async () => {
    const company = await getCurrentCompany();
    setCurrentCompany(company);
  };

  useEffect(() => {
    loadCompany();
    loadClasses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {Boolean(currentCompany) && <TitleCompanyName company={currentCompany} />}

      <FlatList
        data={classes}
        keyExtractor={(item) => `class-${item.id}`}
        renderItem={({ item }) => (
          <ClassCard
            imageUri="https://example.com/imagen.jpg"
            name={item.name}
            description={item.description}
            days={item.weekdays}
          />
        )}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={() => !loading && (
          <Text style={{ textAlign: "center", marginTop: 20 }}>No hay clases disponibles</Text>
        )}
      />
    </View>
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
