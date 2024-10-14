import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useSelector } from 'react-redux';
import { getStorage, ref , uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, addDoc, collection } from 'firebase/firestore';


const NewPostScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user.user);

  console.log('user', user);


  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const handlePost = async () => {
    if (!image) {
      alert('이미지를 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const uuid = generateUUID();
      const storage = getStorage();
      const storageRef = ref(storage, `${user.uid}/feeds/${uuid}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          setIsLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const post = {
            id: uuid,
            image: downloadURL,
            caption: caption,
            likes: 0,
            comments: [],
            createdAt: new Date(),
            userId: user.uid,
            nick: user.userId
          };

          const db = getFirestore();
          await addDoc(collection(db, 'feeds'), post);

          console.log('포스트 업로드 완료');
          setCaption('');
          setImage(null);
          setIsLoading(false);
          navigation.navigate('Home');
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      alert('포스트 업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>새 게시물</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.shareText}>공유</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>사진 찍기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>갤러리에서 선택</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="문구 입력..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS==='ios'? 40 : 0,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareText: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    padding: 15,
    fontSize: 16,
  },
});

export default NewPostScreen;