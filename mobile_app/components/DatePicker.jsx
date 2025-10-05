import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomText from '@/components/CustomText';

const DatePicker = ({ visible, onClose, onConfirm, initialDate = new Date(), label='Seleccionar fecha' }) => {
  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [year, setYear] = useState(initialDate.getFullYear());

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];
  const years = Array.from({ length: 50 }, (_, i) => 1970 + i);

  const handleConfirm = () => {
    onConfirm(new Date(year, month, day));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <CustomText style={styles.title}>{label}</CustomText>

          <View style={styles.pickerContainer}>
            <CustomText style={styles.title}>Día:</CustomText>
            <Picker
              selectedValue={day}
              onValueChange={(val) => setDay(val)}
              style={styles.picker}
            >
              {days.map(d => <Picker.Item key={d} label={d.toString()} value={d} />)}
            </Picker>

            <CustomText style={styles.title}>Mes:</CustomText>
            <Picker
              selectedValue={months[month]}
              onValueChange={(val, index) => setMonth(index)}
              style={styles.picker}
            >
              {months.map((m, i) => <Picker.Item key={i} label={m} value={m} />)}
            </Picker>

            <CustomText style={styles.title}>Año:</CustomText>
            <Picker
              selectedValue={year}
              onValueChange={(val) => setYear(val)}
              style={styles.picker}
            >
              {years.map(y => <Picker.Item key={y} label={y.toString()} value={y} />)}
            </Picker>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose}>
              <CustomText style={styles.cancel}>Cancel</CustomText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <CustomText style={styles.confirm}>Confirm</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.3)',
    justifyContent:'center',
    alignItems:'center'
  },
  container: {
    backgroundColor:'#fff',
    borderRadius:12,
    padding:15,
    width:'90%',
    alignItems:'center'
  },
  title: {
    fontSize:16,
    marginBottom:20,
    fontWeight:'500'
  },
  pickerContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    width:'100%',
    marginBottom:20
  },
  picker: {
    flex:1,
    height:150,
    ...Platform.select({
      ios:{ backgroundColor:'transparent' },
      android:{ color:'#000' }
    })
  },
  buttons: {
    flexDirection:'row',
    justifyContent:'space-between',
    width:'100%'
  },
  cancel: { color:'#555' },
  confirm: { color:'#007AFF' }
});

export default DatePicker;
