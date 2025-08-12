import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import FilterTag from '@/components/FilterTag';
import { colors, spacing } from "@/styles";
import { getCurrentCompany } from "@/utils/storage";
import TitleCompanyName from "@/components/TitleCompanyName";
import { getReservationPage } from "@/services/user";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import CustomText from '@/components/CustomText';

dayjs.extend(customParseFormat);

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MyWeekCalendar() {
  const today = dayjs();
  const todayStr = today.format('YYYY-MM-DD');

  const [date, setDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState([]);
  const [currentCompany, setCurrentCompany] = useState();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const monthName = MONTH_NAMES_ES[today.month()];
  const year = today.year();

  // Función para cargar datos (usada en efecto y refresh)
  const loadData = useCallback(async (forDate) => {
    try {
      setLoading(true);
      const res = await getReservationPage({ date: forDate });
      const { classes, sessions } = res;
      const filterNames = classes.map(c => c.name);
      setFilters(filterNames);
      setSessions(sessions);
      if (!selectedFilter && filterNames.length) {
        setSelectedFilter(filterNames[0]);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  // Cargar empresa solo una vez
  useEffect(() => {
    getCurrentCompany().then(setCurrentCompany);
  }, []);

  // Cargar datos cada vez que cambia la fecha
  useEffect(() => {
    loadData(date);
  }, [date, loadData]);

  // Refresh control
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getReservationPage({ date });
      const { classes, sessions } = res;
      const filterNames = classes.map(c => c.name);
      setFilters(filterNames);
      setSessions(sessions);
      if (!selectedFilter && filterNames.length) {
        setSelectedFilter(filterNames[0]);
      }
    } catch (err) {
      console.error('Error refreshing reservations:', err);
    } finally {
      setRefreshing(false);
    }
  }, [date, selectedFilter]);

  // Filtrar sesiones según filtro y fecha
  const filteredSessions = sessions.filter(s =>
    s.date === date && s.category.name === selectedFilter
  );

  // Separar mañana y tarde
  const morningSessions = filteredSessions.filter(c => parseInt(c.start_time.split(':')[0]) < 12);
  const afternoonSessions = filteredSessions.filter(c => parseInt(c.start_time.split(':')[0]) >= 12);

  // Convertir hora a formato 12h con AM/PM usando dayjs
  const formatTime = (timeStr) => {
    const [hourStr, minute] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const renderSessionItem = ({ item }) => {
    const isFull = item.attendees >= item.capacity;
    const percentage = Math.min((item.attendees / item.capacity) * 100, 100);

    return (
      <TouchableOpacity
        style={[styles.classCard, isFull && { backgroundColor: '#f5f5f5' }]}
        onPress={() => {
          console.log(`Sesión seleccionada: ${item.category.name} a las ${item.start_time}`);
        }}
      >
        <CustomText style={styles.time}>{formatTime(item.start_time)}</CustomText>
        <CustomText style={styles.className} numberOfLines={1}>
          {item.category.name}
        </CustomText>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${percentage}%`, backgroundColor: item.category.color_rgb || colors.blue },
              isFull && { backgroundColor: colors.danger },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CalendarProvider date={date} onDateChanged={setDate}>
      <SafeAreaView style={{ flex: 1 }}>
        {currentCompany && <TitleCompanyName company={currentCompany} />}

        <View style={{ padding: spacing.sm, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 15, color: colors.primary, textAlign: 'center' }}>
            {monthName} {year}
          </Text>
        </View>

        <WeekCalendar
          onDayPress={(day) => setDate(day.dateString)}
          minDate={todayStr}
          markedDates={{
            [date]: {
              selected: true,
              selectedColor: colors.primary,
              selectedTextColor: '#fff',
            },
          }}
        />

        {/* Lista de filtros horizontal */}
        <View style={{ height: 35, marginVertical: 5 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10 }}
          >
            {filters.map(filter => (
              <FilterTag
                key={filter}
                label={filter}
                active={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: spacing.md, flex: 1 }}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#000" />
          ) : filteredSessions.length > 0 ? (
            <View style={{ flex: 1 }}>
              {morningSessions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Por la mañana</Text>
                  <FlatList
                    data={morningSessions.sort((a,b) => a.start_time.localeCompare(b.start_time))}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderSessionItem}
                    numColumns={3}
                    columnWrapperStyle={{ justifyContent: 'flex-start' }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  />
                </>
              )}
              {afternoonSessions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Por la tarde</Text>
                  <FlatList
                    data={afternoonSessions.sort((a,b) => a.start_time.localeCompare(b.start_time))}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderSessionItem}
                    numColumns={3}
                    columnWrapperStyle={{ justifyContent: 'flex-start' }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  />
                </>
              )}
            </View>
          ) : (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay clases para este día</Text>
            </ScrollView>
          )}

        </View>
      </SafeAreaView>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
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
  },
});
