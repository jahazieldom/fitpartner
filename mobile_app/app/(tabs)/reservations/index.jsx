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
  Alert,
} from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import FilterTag from '@/components/FilterTag';
import { colors, spacing, layout } from "@/styles";
import TitleCompanyName from "@/components/TitleCompanyName";
import { getReservationPage, bookSession, waitlistSession, getReservations } from "@/services/user";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import CustomText from '@/components/CustomText';
import ReservationConfirm from '@/components/ReservationConfirm';
import ReservationInfo from '@/components/ReservationInfo';
import ReservationWaitlist from '@/components/ReservationWaitlist';
import Modal from "react-native-modal";
import FontAwesome from '@expo/vector-icons/FontAwesome';


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
  const [selectedFilter, setSelectedFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(0);
  const [myReservations, setMyReservations] = useState([]);
  
  let dateObj = today
  if (date) {
    dateObj = dayjs(date)
  }

  const monthName = MONTH_NAMES_ES[dateObj.month()];
  const year = today.year();

  const getMarkedDates = (reservations, dotColor = 'blue') => {
    return reservations.reduce((acc, reservation) => {
      acc[reservation.date] = { marked: true, selectedColor: colors.primary };
      return acc;
    }, {});
  };

  // Función para cargar datos (usada en efecto y refresh)
  const loadData = useCallback(async (forDate) => {
    try {
      setLoading(true);
      const res = await getReservationPage({ date: forDate });
      const { classes, sessions } = res;
      const filterNames = classes.map(c => c.name);
      setFilters(filterNames);
      setSessions(sessions);
      setMyReservations(res.my_reservations)

      if (!selectedFilter && filterNames.length) {
        setSelectedFilter(filterNames[0]);
      }

      if (res.current_plan) {
        setCurrentPlan(res.current_plan)
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

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
      setMyReservations(res.my_reservations)
      if (!selectedFilter && filterNames.length) {
        setSelectedFilter(filterNames[0]);
      }

      if (res.current_plan) {
        setCurrentPlan(res.current_plan)
      }
    } catch (err) {
      console.error('Error refreshing reservations:', err);
    } finally {
      setRefreshing(false);
    }
  }, [date, selectedFilter]);

  const handleSessionReservation = (item) => {
    if (currentPlan && currentPlan.remaining_sessions <= 0) {
      return Alert.alert("Límite de plan", "Se ha llegado al límite de su plan")
    }

    setSelectedSession(item);
  };

  const confirmReservationSession = async () => {
    try {
      let response = await bookSession(selectedSession.id)
      if (response.status == "success") {
        closeModalReservation(null);
        onRefresh()
      } else {
        Alert.alert("Error al reservar", response?.message);
      }
    } catch (error) {
      Alert.alert("Error al reservar", String(error.data?.message));
    }
  };

  const closeModalReservation = () => setSelectedSession(null);
  const markedDates = getMarkedDates(myReservations)

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

    const reserved = Boolean(myReservations.find(x => x.session.id == item.id))
    return (
      <TouchableOpacity
        style={[styles.classCard, (isFull && !reserved) && { backgroundColor: '#f5f5f5' }]}
        onPress={() => {
          item.reserved = reserved
          item.isFull = isFull
          item.percentage = percentage
          handleSessionReservation(item)
        }}
      >
        <View style={[layout.row, layout.gap]}>
          {reserved && <FontAwesome name="calendar-check-o" size={13} color={colors.success} /> }
          <CustomText style={[styles.time, reserved && {color: colors.success}]}> 
            {formatTime(item.start_time)}
          </CustomText>
        </View>
        <CustomText style={[styles.className]} numberOfLines={1}>
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
        <TitleCompanyName />

        <View style={{ padding: spacing.sm, backgroundColor: 'white' }}>
          <Text style={{ fontSize: 15, color: colors.primary, textAlign: 'center' }}>
            {monthName} {year}
          </Text>
        </View>

        <WeekCalendar
          current={date}
          onDayPress={(day) => {
            console.log(day.dateString)
            setDate(day.dateString)
          }}
          minDate={todayStr}
          markedDates={{
            [date]: {
              selected: true,
              selectedColor: colors.primary,
              selectedTextColor: '#fff',
            },
            ...markedDates
          }}
        />

        {/* Lista de filtros horizontal */}
        { Boolean(filters && filters.length > 1) && 
        <View style={{ height: 35, marginTop: 10 }}>
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
        }

        <View style={{...layout.container, paddingVertical: spacing.sm, flex: 1}}>
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

        {/* Modal de confirmación */}
        <Modal
          isVisible={!!selectedSession}
          onBackdropPress={closeModalReservation}
          onSwipeComplete={closeModalReservation}
          swipeDirection="down"
          style={styles.modal}
          coverScreen={false}

          backdropColor="black"      // color del fondo
          backdropOpacity={0.3}      // opacidad (0 a 1)
        >
          <View style={styles.modalContent}>
            {selectedSession && 
            <>
              { !selectedSession.isFull ? (
                selectedSession.reserved ? (
                  <ReservationInfo  
                  onClose={closeModalReservation} 
                  onConfirm={confirmReservationSession} 
                  session={selectedSession} 
                  />
                ) : (
                  <ReservationConfirm  
                  onClose={closeModalReservation} 
                  onConfirm={confirmReservationSession} 
                  session={selectedSession} 
                  />
                )
              ): (
                <ReservationWaitlist  
                  onClose={closeModalReservation} 
                  onConfirm={confirmReservationSession} 
                  session={selectedSession} 
                />
              )}
            </>
            }
          </View>
        </Modal>
      </SafeAreaView>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 13,
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
  },
});
