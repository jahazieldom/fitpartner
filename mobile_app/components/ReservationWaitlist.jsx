import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { colors, typography, components, spacing, layout } from "@/styles";
import CustomText from '@/components/CustomText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import StatusButton from '@/components/StatusButton';


export default function ReservationWaitlist({
    session = null,
    onClose = () => {},
    onConfirm = () => {},
}) {
    const formatearFechaISO = (isoDate) => {
        const fecha = new Date(isoDate);
    
        const opciones = {
            weekday: "long",
            day: "numeric",
            month: "long",
        };
    
        return new Intl.DateTimeFormat("es-MX", opciones)
            .format(fecha)
            .replace(",", "")  // quitar coma
            .toLowerCase();    // todo en minúsculas
    }
    
    const formatTime = (timeStr) => {
        const [hourStr, minute] = timeStr.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minute} ${ampm}`;
    };
    
  return (
    <View>
        { Boolean(session) && 
        <>
            <View style={{paddingVertical: spacing.md}}>
                <View style={[layout.row, layout.center]}>
                    <MaterialCommunityIcons style={{opacity: .7, marginVertical: spacing.sm}}  name="calendar-clock-outline" size={30} color={colors.danger} />
                </View>
                <CustomText style={{...components.cardTitle, textAlign: 'center'}}>Únete a la lista de espera</CustomText>
            </View>
            <Text style={{textAlign: 'center', paddingVertical: spacing.lg}}>
                La sesión de {session.category?.name} del {formatearFechaISO(session.date)} a las {formatTime(session.start_time)} ya está llena. Puedes unirte a la lista de espera por si se libera un lugar.
            </Text>

            <View style={[layout.row, layout.center, {marginBottom: 10}]}>
                <TouchableOpacity
                style={[components.button, {paddingVertical: 12}]}
                onPress={onClose}
                >
                <Text style={components.buttonText}>Unirme en lista de espera</Text>
                </TouchableOpacity>
            </View>
        </>
        }
    </View>
  );
}
