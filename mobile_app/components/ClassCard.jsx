import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { colors, typography, components, spacing } from "@/styles";

export default function ClassCard({ imageUri, name, description, days }) {
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

const styles = StyleSheet.create({
  card: {
    width: 260,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 10,
    padding: 12,
  },
  image: {
    width: '100%',
    height: 130,
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
