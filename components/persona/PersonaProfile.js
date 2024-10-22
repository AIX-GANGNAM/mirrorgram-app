import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { app } from '../../firebaseConfig'; // Firebase 설정 파일 import
import { doc, updateDoc, getFirestore, setDoc, getDoc } from 'firebase/firestore';

const PersonaProfile = ({ route, navigation }) => {
    const { persona, userId } = route.params;
    const personaId = `${userId}_${persona.title.toLowerCase().replace(/\s+/g, '_')}`;

    // 초기 관심사 상태 설정 (빈 배열로 초기화)
    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');

    const db = getFirestore(app);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: '페르소나 프로필',
            headerTitleAlign: 'center',
        });

        // Firestore에서 초기 관심사 로드
        const loadInterests = async () => {
            try {
                const personaRef = doc(db, 'personas', personaId);
                const docSnap = await getDoc(personaRef);

                if (docSnap.exists()) {
                    // Firestore에서 데이터 가져와 상태 설정
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

            // 문서가 존재하는지 먼저 확인합니다.
            const docSnap = await getDoc(personaRef);
            if (docSnap.exists()) {
                // 문서가 존재하면 업데이트
                await updateDoc(personaRef, { interests: updatedInterests });
            } else {
                // 문서가 존재하지 않으면 새로 생성
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
            // 최대 개수를 10개로 제한
            if (interests.length >= 10) {
                Alert.alert('제한', '관심사는 최대 10개까지만 추가할 수 있습니다.');
                return;
            }

            const updatedInterests = [...interests, newInterest.trim()];
            setInterests(updatedInterests);
            setNewInterest('');
            updateInterestsInFirebase(updatedInterests);
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
            {/* 페르소나 이미지 */}
            <Image source={{ uri: persona.image }} style={styles.image} />
            {/* 페르소나 이름 */}
            <Text style={styles.name}>{persona.title}</Text>
            {/* 수평선 추가 */}
            <View style={styles.horizontalLine} />
            {/* 관심사 목록 */}
            <View style={styles.interestsContainer}>
                <Text style={styles.interestsTitle}>관심 키워드♥</Text>
                <Text style={styles.interestsLimitText}>최대 10개까지 추가할 수 있습니다.</Text>
                <View style={styles.interestsList}>
                    {interests.map((interest, index) => (
                        <View key={index} style={styles.interestBubble}>
                            <Text style={styles.interestText}>{interest}</Text>
                            {/* 관심사 제거 버튼 */}
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

            {/* <Image source={require('../../assets/persona/brain.jpg')} style={styles.additionalImage} /> */}

            {/* 관심사 추가 입력란 */}
            <View style={styles.addInterestContainer}>
                <TextInput
                    style={styles.input}
                    value={newInterest}
                    onChangeText={setNewInterest}
                    placeholder="새 관심사 추가"
                />
                <TouchableOpacity style={styles.addButton} onPress={addInterest}>
                    <Text style={styles.addButtonText}>추가</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// 스타일 정의
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    additionalImage: {
        width: 200,
        height: 100,
        marginBottom: 15,
        borderRadius: 10,
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
        width: '90%',           // 수평선의 너비를 전체 화면의 90%로 설정
        height: 1,              // 높이를 1로 설정해 얇은 선을 만듦
        backgroundColor: '#ccc', // 회색으로 설정해 선을 강조하지 않음
        marginVertical: 15,     // 수평선 위아래 여백을 15로 설정하여 균형 조정
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
        color: '#888',  // 회색으로 눈에 띄지 않지만 강조할 수 있도록 설정
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
