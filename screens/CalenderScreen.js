import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Alert, Platform, StatusBar, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios'; // axios 추가
import { useSelector } from 'react-redux'; // redux useSelector 추가

const CalendarScreen = () => {
  const [schedule, setSchedule] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: new Date() });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const auth = getAuth();
  const user = auth.currentUser;
  const reduxUser = useSelector((state) => state.user.user); // redux user 정보 가져오기

  const fetchSchedule = async () => {
    if (user) {
      const userRef = doc(db, 'calendar', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setSchedule(userDoc.data().events || []);
      }
    }
  };

  // 화면에 진입할 때마다 스케줄을 불러옴
  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [user])
  );

  const addEvent = async () => {
    if (newEvent.title.trim() === '') {
      Alert.alert('오류', '유효한 일정 제목을 입력하세요.');
      return;
    }

    const event = { ...newEvent, date: selectedDate, starred: false };
    setSchedule([...schedule, event]);
    setNewEvent({ title: '', time: new Date() });
    setModalVisible(false);

    if (user) {
      const userRef = doc(db, 'calendar', user.uid);
      await updateDoc(userRef, {
        events: arrayUnion(event),
      }).catch(async (error) => {
        if (error.code === 'not-found') {
          await setDoc(userRef, { events: [event] });
        }
      });
    }
  };

  const toggleStarEvent = async (event) => {
    const updatedEvent = { ...event, starred: !event.starred };
    const updatedSchedule = schedule.map((e) => (e === event ? updatedEvent : e));
    setSchedule(updatedSchedule);

    if (user) {
      const userRef = doc(db, 'calendar', user.uid);
      await updateDoc(userRef, {
        events: arrayRemove(event),
      });
      await updateDoc(userRef, {
        events: arrayUnion(updatedEvent),
      });
    }

    // 별표 상태 변경 시 서버에 통신 (redux에서 userPhone 존재 시에만 요청)
    if (reduxUser.userPhone && reduxUser.userPhone.trim() !== "") {
      console.log("reduxUser.userPhone", reduxUser.userPhone);
      console.log("user.uid", user.uid);
      console.log("event.title", event.title);
      console.log("updatedEvent.starred", updatedEvent.starred);
      console.log("event.time", event.time instanceof Date ? event.time.toISOString() : event.time.toDate().toISOString());
      try {
        await axios.post('http://localhost:8000/star-event', {
          uid: user.uid,
          eventId: event.title, // 고유한 식별자가 필요하다면 별도의 ID 사용 고려
          starred: updatedEvent.starred,
          time: event.time instanceof Date ? event.time.toISOString() : event.time.toDate().toISOString(),
          userPhone : reduxUser.userPhone,
        });
      } catch (error) {
        console.error('별표 상태 변경 오류:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>캘린더</Text>
      </View>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007bff' },
          ...schedule.reduce((acc, event) => {
            acc[event.date] = { marked: true, dotColor: '#007bff' };
            return acc;
          }, {}),
        }}
      />
      <ScrollView style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>일정 타임라인</Text>
        <Text style={styles.selectedDateText}>{selectedDate}</Text>
        {schedule.filter(event => event.date === selectedDate).sort((a, b) => new Date(a.time) - new Date(b.time)).map((event, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineItemHeader}>
              <Text style={styles.timelineEventTitle}>{event.title}</Text>
              <TouchableOpacity onPress={() => toggleStarEvent(event)}>
                <Icon
                  name={event.starred ? 'star' : 'star-outline'}
                  size={24}
                  color={event.starred ? '#ffd700' : '#555'}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.timelineEventTime}>
              {event.time instanceof Date
                ? event.time.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true })
                : event.time.toDate
                ? event.time.toDate().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true })
                : '시간 미정'}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="add-circle" size={60} color="#007bff" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>새 일정 만들기</Text>
          <TextInput
            style={styles.input}
            placeholder="일정 제목"
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
          />
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>시간 선택:</Text>
            <DateTimePicker
              value={newEvent.time}
              mode="time"
              display="spinner"
              textColor="#007bff"
              onChange={(event, selectedTime) => setNewEvent({ ...newEvent, time: selectedTime || newEvent.time })}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addEventButton} onPress={addEvent}>
              <Text style={styles.addEventButtonText}>일정 추가</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 55,
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    elevation: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  timePickerContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
  },
  addEventButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  addEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 10,
  },
  timelineItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  timelineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineEventTime: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default CalendarScreen;
