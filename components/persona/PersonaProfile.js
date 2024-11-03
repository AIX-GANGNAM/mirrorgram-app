import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { app } from '../../firebaseConfig'; // Firebase 설정 파일 import
import { doc, updateDoc, getFirestore, setDoc, getDoc } from 'firebase/firestore';

const PersonaProfile = ({ route, navigation }) => {
    console.log("PersonaProfile.js > 호출됨");
    const { persona, userId } = route.params;
    // console.log("페르소나: " + JSON.stringify(persona), "유저 아이디: " + userId);
    const personaId = `${userId}_${persona.persona ? persona.persona.toLowerCase() : 'default'}`;  // 영어 persona 값을 사용하여 ID 생성

    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState(persona.name); // 초기값으로 현재 이름 설정
    const [displayName, setDisplayName] = useState(persona.title);

    const db = getFirestore(app);
    const inputRef = useRef(null);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: `${persona.title} 프로필`,
            headerTitleAlign: 'center',
        });

        loadProfile();
        loadInterests();
    }, [navigation, personaId]);

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

    // 프로필 로드 함수 
    const loadProfile = async () => {
        try {
            const personaRef = doc(db, 'personas', personaId);
            const docSnap = await getDoc(personaRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data.profile && data.profile.name) {
                    setNewName(data.profile.name);
                }
            }
        } catch (error) {
            console.error('Failed to load profile from Firebase:', error);
            Alert.alert('오류', '프로필을 불러오지 못했습니다.');
        }
    };

    // handleSave 함수 수정
    const handleSave = async () => {
        try {
            // personas 컬렉션 업데이트
            const personaRef = doc(db, 'personas', personaId);
            const docSnap = await getDoc(personaRef);
            
            if (docSnap.exists()) {
                await updateDoc(personaRef, {
                    'profile.name': newName
                });
            } else {
                await setDoc(personaRef, {
                    profile: {
                        name: newName
                    }
                });
            }

            // users 컬렉션의 persona 필드 업데이트
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                [`persona.${persona.persona.toLowerCase()}_title`]: newName
            });
                
            setDisplayName(newName);
            navigation.setOptions({
                headerTitle: `${newName} 프로필`,
            });
            
            setModalVisible(false);
            Alert.alert('성공', '이름이 수정되었습니다.');
        } catch (error) {
            console.error('Failed to update name in Firebase:', error);
            Alert.alert('오류', '이름 수정에 실패했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: persona.image }} style={styles.image} />
            <View style={styles.nameContainer}>
                <Text style={styles.name}>{displayName}</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editButton}>
                    <Ionicons name="pencil" size={20} color="black" />
                </TouchableOpacity>
            </View>
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
                    autoCorrect={false}
                    placeholder="새 관심사 추가"
                />
                <TouchableOpacity style={styles.addButton} onPress={addInterest}>
                    <Text style={styles.addButtonText}>추가</Text>
                </TouchableOpacity>
            </View>
            

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>이름 수정</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="새 이름 입력"
                            placeholderTextColor="#999"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.modalButtonCancel}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalButtonSubmit}
                                onPress={handleSave}
                            >
                                <Text style={styles.modalButtonTextSubmit}>수정</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
        marginLeft : 250,
    },
    name: {
        flex: 1,
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    editButton: {
        marginRight:230,
        // cursor : 'pointer'
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    modalInput: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 25,
        backgroundColor: '#f9f9f9',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButtonCancel: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#ccc',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonSubmit: {
        flex: 1,
        backgroundColor: '#0095f6',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonTextCancel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    modalButtonTextSubmit: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PersonaProfile;
