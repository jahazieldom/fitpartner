import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import FilterTag from '@/components/FilterTag';
import { colors, typography, components, spacing } from "@/styles";
import { getCurrentCompany } from "@/utils/storage";
import TitleCompanyName from "@/components/TitleCompanyName";

// Función para simular fetch de datos
const fetchClasses = (selectedDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Datos falsos solo para ejemplo
      const mockData = {
        '2025-08-10': [
          { id: 1, status: 'reserve', category: 'Yoga', name: 'Yoga Flow', startTime: '05:00', duration: 60, limit: 15, attendees: 10 },
          { id: 1, status: 'reserve', category: 'Yoga', name: 'Yoga Flow', startTime: '06:00', duration: 60, limit: 15, attendees: 10 },
          { id: 1, status: 'reserve', category: 'Yoga', name: 'Yoga Flow', startTime: '07:00', duration: 60, limit: 15, attendees: 10 },
          { id: 1, status: 'reserve', category: 'Yoga', name: 'Yoga Flow', startTime: '08:00', duration: 60, limit: 15, attendees: 10 },
          { id: 1, status: 'reserve', category: 'Yoga', name: 'Yoga Flow', startTime: '09:00', duration: 60, limit: 15, attendees: 15 },
          { id: 2, status: 'waitlist', category: 'CrossFit', name: 'CrossFit', startTime: '10:00', duration: 45, limit: 12, attendees: 12 },
          { id: 3, status: 'reserve', category: 'Pilates', name: 'Pilates', startTime: '13:00', duration: 50, limit: 10, attendees: 5 },
          { id: 4, status: 'reserve', category: 'Yoga', name: 'Power Yoga', startTime: '15:30', duration: 45, limit: 14, attendees: 9 },
          { id: 5, status: 'reserve', category: 'CrossFit', name: 'CrossFit', startTime: '16:30', duration: 45, limit: 14, attendees: 2 },
          { id: 6, status: 'reserve', category: 'Yoga', name: 'Power Yoga', startTime: '17:30', duration: 45, limit: 14, attendees: 2 },
          { id: 7, status: 'reserve', category: 'CrossFit', name: 'CrossFit', startTime: '18:30', duration: 45, limit: 14, attendees: 0 },
          { id: 8, status: 'reserve', category: 'Yoga', name: 'Power Yoga', startTime: '18:30', duration: 45, limit: 14, attendees: 0 },
          { id: 8, status: 'reserve', category: 'Yoga', name: 'Power Yoga', startTime: '19:30', duration: 45, limit: 14, attendees: 0 },
          { id: 8, status: 'reserve', category: 'Yoga', name: 'Power Yoga', startTime: '20:30', duration: 45, limit: 14, attendees: 0 },
          { id: 8, status: 'reserve', category: 'Yoga', name: 'Power Yoga', startTime: '21:30', duration: 45, limit: 14, attendees: 0 },
        ],
        '2025-08-11': [
          { id: 5, status: 'reserve', category: 'Pilates', name: 'Pilates', startTime: '09:30', duration: 50, limit: 10, attendees: 4 },
        ],
        '2025-08-12': [],
      };

      resolve(mockData[selectedDate] || []);
    }, 800);
  });
};

export default function MyWeekCalendar() {
  const [date, setDate] = useState('2025-08-10');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [currentCompany, setCurrentCompany] = useState();
  const [selectedFilter, setSelectedFilter] = useState('Yoga');

  const filters = ['Yoga', 'CrossFit', 'Pilates'];

  useEffect(() => {
    setLoading(true);
    fetchClasses(date).then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, [date]);

  useEffect(() => {
    const load = async () => {
      setCurrentCompany(await getCurrentCompany())
    }

    load()
  })

  const filteredClasses = classes.filter((cls) => {
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Reservar') return cls.status === 'reserve';
    if (selectedFilter === 'En espera') return cls.status === 'waitlist';
    return cls.category === selectedFilter;
  });

  const morningClasses = filteredClasses.filter((c) => parseInt(c.startTime.split(':')[0]) < 12);
  const afternoonClasses = filteredClasses.filter((c) => parseInt(c.startTime.split(':')[0]) >= 12);

  const renderClassItem = ({ item }) => {
    const isFull = item.attendees >= item.limit;
    const percentage = Math.min((item.attendees / item.limit) * 100, 100);

    // convertir hora
    const [hour, minute] = item.startTime.split(':').map(Number);
    let displayTime;
    if (hour >= 12) {
      const hour12 = hour === 12 ? 12 : hour - 12;
      displayTime = `${hour12}:${minute.toString().padStart(2, '0')} PM`;
    } else {
      displayTime = `${hour}:${minute.toString().padStart(2, '0')} AM`;
    }

    return (
      <TouchableOpacity
        style={[
          styles.classCard,
          isFull && { backgroundColor: '#f5f5f5' } // gris muy claro si está llena
        ]}
        onPress={() => {
          console.log(`Clase seleccionada: ${item.name} a las ${item.startTime}`);
        }}
      >
        <Text style={styles.time}>{displayTime}</Text>
        <Text style={styles.className} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${percentage}%` },
              isFull && { backgroundColor: colors.danger } // barra roja si está llena
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <CalendarProvider date={date} onDateChanged={setDate}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{backgroundColor: 'white'}}>
          { Boolean(currentCompany) && 
            <TitleCompanyName company={currentCompany} />
          }

          <WeekCalendar
            onDayPress={(day) => setDate(day.dateString)}
            markedDates={{
              [date]: {
                selected: true,
                selectedColor: colors.primary,
                selectedTextColor: '#fff',
              },
            }}
            showWeekNumbers={true}
          />

        </View>

        {/* Lista de filtros horizontal */}
        <View style={{ height: 45, marginVertical: 5 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10 }}
          >
            {filters.map((filter) => (
              <FilterTag
                key={filter}
                label={filter}
                active={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#000" />
        ) : filteredClasses.length > 0 ? (
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            {morningClasses.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Por la mañana</Text>
                <FlatList
                  data={morningClasses}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderClassItem}
                  numColumns={3}
                  columnWrapperStyle={{ justifyContent: 'flex-start' }}
                  contentContainerStyle={{ marginBottom: 10 }}
                />
              </>
            )}
            {afternoonClasses.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Por la tarde</Text>
                <FlatList
                  data={afternoonClasses}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderClassItem}
                  numColumns={3}
                  columnWrapperStyle={{ justifyContent: 'flex-start' }}
                />
              </>
            )}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay clases para este día</Text>
        )}
      </SafeAreaView>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#eee',
    borderRadius: 16,
    marginRight: 6,
  },
  tagActive: {
    backgroundColor: '#4caf50',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  tagTextActive: {
    color: '#fff',
    // fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
    paddingVertical: 5,
  },
  classCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    margin: 5,
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  time: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  className: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.blue,
  },
});
