import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { app } from '../../firebaseConfig'; // Firebase 설정 파일 import
import { doc, updateDoc, getFirestore, setDoc, getDoc } from 'firebase/firestore';

const PersonaProfile = ({ route, navigation }) => {
    const { persona, userId } = route.params;
    const personaId = `${userId}_${persona.persona}`;  // 영어 persona 값을 사용하여 ID 생성

    console.log('Firebase에 저장될 personaId:', personaId); // 로그 추가

    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');

    const db = getFirestore(app);
    const inputRef = useRef(null);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: `${persona.title} 프로필`,
            headerTitleAlign: 'center',
        });

        // Firestore에서 초기 관심사 로드
        const loadInterests = async () => {
            try {
                const personaRef = doc(db, 'personas', personaId);
                const docSnap = await getDoc(personaRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && data.interests) {
                        setInterests(data.interests);
                    }
                } else {
                    console.log('해당 페르소나 문서가 존재하지 않습니다.');
                }
            } catch (error) {
                console.error('Failed to load interests from Firebase:', error);
                Alert.alert('오류', '관심사를 불러오지 못했습니다. 다시 시도해주세요.');
            }
        };

        loadInterests();
    }, [navigation, personaId]);

    // Firebase에서 관심사 업데이트
    const updateInterestsInFirebase = async (updatedInterests) => {
        try {
            const personaRef = doc(db, 'personas', personaId);
            const docSnap = await getDoc(personaRef);
            if (docSnap.exists()) {
                await updateDoc(personaRef, { interests: updatedInterests });
            } else {
                await setDoc(personaRef, { interests: updatedInterests });
            }
        } catch (error) {
            console.error('Failed to update interests in Firebase:', error);
            Alert.alert('오류', '관심사 업데이트에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 새로운 관심사 추가 함수
    const addInterest = () => {
        if (newInterest.trim()) {
            if (interests.length >= 10) {
                Alert.alert('제한', '관심사는 최대 10개까지만 추가할 수 있습니다.');
                return;
            }

            const updatedInterests = [...interests, newInterest.trim()];
            setInterests(updatedInterests);
            setNewInterest('');
            updateInterestsInFirebase(updatedInterests);
            inputRef.current?.focus();
        }
    };

    // 특정 관심사 제거 함수
    const removeInterest = (indexToRemove) => {
        const updatedInterests = (interests || []).filter((_, index) => index !== indexToRemove);
        setInterests(updatedInterests);
        updateInterestsInFirebase(updatedInterests);
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: persona.image }} style={styles.image} />
            <Text style={styles.name}>{persona.title}</Text>
            <View style={styles.horizontalLine} />
            <View style={styles.interestsContainer}>
                <Text style={styles.interestsTitle}>관심 키워드♥</Text>
                <Text style={styles.interestsLimitText}>최대 10개까지 추가할 수 있습니다.</Text>
                <View style={styles.interestsList}>
                    {interests.map((interest, index) => (
                        <View key={index} style={styles.interestBubble}>
                            <Text style={styles.interestText}>{interest}</Text>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeInterest(index)}
                            >
                                <Ionicons name="close-circle" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
            <View style={styles.addInterestContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={newInterest}
                    onChangeText={setNewInterest}
                    onSubmitEditing={addInterest}
                    blurOnSubmit={false}
                    multiline={false}
                    keyboardType="visible-password"
                    autoCorrect={false}
                    placeholder="새 관심사 추가"
                />
                <TouchableOpacity style={styles.addButton} onPress={addInterest}>
                    <Text style={styles.addButtonText}>추가</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    horizontalLine: {
        width: '90%',
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 15,
    },
    interestsContainer: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    interestsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    interestsLimitText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    interestsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    interestBubble: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        margin: 5,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    interestText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        marginRight: 8,
    },
    removeButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    addInterestContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        padding: 12,
        marginRight: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default PersonaProfile;
