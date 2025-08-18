import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';
import CustomText from '@/components/CustomText';

export default function ClientPlanCard({planInfo}) {
  console.log(planInfo)
  if (!planInfo) return null;

  const {
    name,
    purchase_date,
    first_use_date,
    is_active,
    remaining_sessions,
    expiration_date,
    plan_expiry_description,
    expiration_label,
  } = planInfo;

  // Asumo que el plan tiene sesiones totales para calcular progreso
  // Si no tienes el total, usa aquí un valor fijo o envíalo como prop
  const totalSessions = 30; // Ejemplo, deberías cambiarlo si tienes el dato real
  const progress = Math.min(remaining_sessions / totalSessions, 1);

  return (
    <View style={styles.card}>
      <CustomText style={styles.planName}>{plan_expiry_description}</CustomText>
      <CustomText style={styles.info}>Fecha compra: {purchase_date}</CustomText>
      {/* <CustomText style={styles.info}>Primer uso: {first_use_date || 'No usado aún'}</CustomText> */}
      <CustomText style={styles.info}>Sesiones restantes: {remaining_sessions}</CustomText>
      <CustomText style={styles.info}>Expira el: {expiration_date}</CustomText>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <CustomText style={styles.progressText}>{Math.round(progress * 100)}% sesiones restantes</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
    elevation: 3, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: '100%',
  },
  planName: {
    fontSize: typography.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  expirationLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  info: {
    fontSize: typography.sm,
    marginBottom: spacing.xs,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    marginTop: spacing.xs,
    fontSize: typography.xs,
    textAlign: 'right',
    color: colors.textSecondary,
  },
});