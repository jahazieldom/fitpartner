import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { colors, typography, components, spacing, layout } from "@/styles";
import CustomText from '@/components/CustomText';
import FontAwesome from '@expo/vector-icons/FontAwesome';
// import StatusButton from '@/components/StatusButton';


export default function ReservationConfirm({
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
                    <FontAwesome style={{opacity: .7, marginVertical: spacing.sm}} name="calendar-check-o" size={26} color={colors.success} />
                </View>
                <CustomText style={{...components.cardTitle, textAlign: 'center'}}>Confirmar reservación</CustomText>
            </View>
            <Text style={{textAlign: 'center', paddingVertical: spacing.lg}}>
                Reservar {session.category?.name} el {formatearFechaISO(session.date)} a las {formatTime(session.start_time)}
            </Text>

            <View style={[layout.row, layout.spaceBetween, {marginBottom: 10}]}>
                <TouchableOpacity
                style={[components.button, {paddingVertical: 12}, {backgroundColor: colors.muted}]}
                onPress={onClose}
                >
                <Text>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={[components.button, {paddingVertical: 12}]}
                onPress={onConfirm}
                >
                <Text style={components.buttonText}>Confirmar reserva</Text>
                </TouchableOpacity>
            </View>
        </>
        }
    </View>
  );
}
