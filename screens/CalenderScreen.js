import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, StyleSheet, Alert, Platform, StatusBar, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { startOfMonth, endOfMonth, addDays, format, getDay, addMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

const CalenderScreen = () => {
  const [schedule, setSchedule] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: new Date() });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const addEvent = () => {
    if (newEvent.title.trim() === '') {
      Alert.alert('Error', 'Please enter a valid event title.');
      return;
    }
    setSchedule([...schedule, { ...newEvent, date: format(selectedDate, 'yyyy-MM-dd') }]);
    setNewEvent({ title: '', time: new Date() });
    setModalVisible(false);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventText}>{format(new Date(item.date), 'PPP', { locale: ko })} - {item.time.toLocaleTimeString()} - {item.title}</Text>
    </View>
  );

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <TouchableOpacity onPress={() => changeMonth(-1)}>
        <Text style={styles.headerButton}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{format(selectedDate, 'MMMM yyyy', { locale: ko })}</Text>
      <TouchableOpacity onPress={() => changeMonth(1)}>
        <Text style={styles.headerButton}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );

  const changeMonth = (direction) => {
    setSelectedDate(addMonths(selectedDate, direction));
  };

  const renderDaysOfWeek = () => {
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    return (
      <View style={styles.daysOfWeekContainer}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={styles.dayOfWeekText}>{day}</Text>
        ))}
      </View>
    );
  };

  const renderCalendarDays = () => {
    const start = startOfMonth(selectedDate);
    const startDayOfWeek = getDay(start);
    const daysArray = Array.from({ length: 42 }, (_, i) => addDays(start, i - startDayOfWeek));

    return (
      <View style={styles.calendarDaysContainer}>
        {daysArray.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayButton, day.getMonth() === selectedDate.getMonth() ? styles.currentMonthDay : styles.otherMonthDay, format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && styles.selectedDay]}
            onPress={() => setSelectedDate(day)}
          >
            <Text style={styles.dayText}>{day.getDate()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderCalendarHeader()}
      {renderDaysOfWeek()}
      {renderCalendarDays()}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>
      <FlatList
        data={schedule.filter(item => item.date === format(selectedDate, 'yyyy-MM-dd'))}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderEvent}
        style={styles.scheduleList}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
          />
          <DateTimePicker
            value={newEvent.time}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => setNewEvent({ ...newEvent, time: selectedDate || newEvent.time })}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={addEvent}>
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 55,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
  },
  headerButton: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#e6e6e6',
  },
  dayOfWeekText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  dayButton: {
    width: '13.5%',
    padding: 15,
    alignItems: 'center',
    margin: 2,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  currentMonthDay: {
    backgroundColor: '#fff',
  },
  otherMonthDay: {
    backgroundColor: '#e6e6e6',
  },
  selectedDay: {
    backgroundColor: '#007bff',
  },
  dayText: {
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  scheduleList: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  eventItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  eventText: {
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    flex: 1,
  },
  modalButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CalenderScreen;
