import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, XMarkIcon } from 'react-native-heroicons/solid'; 
import { StyleSheet } from 'react-native';

const PostHeader = ({post, onEdit, onDelete}) => {
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [profileImg, setProfileImg] = useState(null);
  
    useEffect(() => {
      const fetchUserData = async () => {
        const user = post.userId;
        const db = getFirestore();
        const postDoc = doc(db, 'users', user);
        try {
          const docSnap = await getDoc(postDoc);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setProfileImg(userData.profileImg);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
  
      fetchUserData();
    }, [post.userId]);
  
    const handleEdit = () => {
      setShowOptionsModal(false);
      onEdit(post);
    };
  
    const handleDelete = () => {
      setShowOptionsModal(false);
      onDelete(post);
    };
  
  
    
    return(
      <View style={styles.header}>
        <View style={{flexDirection:'row',marginTop:3,}}>
          <TouchableOpacity>
            <Image
              style={styles.image}
              source={profileImg ? {uri: profileImg} : require('../../assets/no-profile.png')} />
          </TouchableOpacity>
  
          <View style={{flexDirection:'row', alignItems: 'center' }}>
            <Text style={styles.user}> {post.nick} </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowOptionsModal(true)}>
          <EllipsisVerticalIcon color='black' size={30} />
        </TouchableOpacity>
  
        <Modal
          animationType="slide"
          transparent={true}
          visible={showOptionsModal}
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
                <PencilIcon color='#0095F6' size={24} />
                <Text style={[styles.modalOptionText, {color: '#0095F6'}]}>피드 수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
                <TrashIcon color='red' size={24} />
                <Text style={[styles.modalOptionText, {color: 'red'}]}>피드 삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => setShowOptionsModal(false)}>
                <XMarkIcon color='black' size={24} />
                <Text style={styles.modalOptionText}>뒤로가기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 5,
        alignItems: 'center',
       },
       image: {
        height: 38,
        width: 38,
        borderRadius: 50,
        padding: 2,
        marginLeft: 8,
      },

      user:{
        color: 'black',
        fontWeight:'bold',
        fontSize: 16,
       },

       modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      },

      modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
      },

      modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
      },
      modalOptionText: {
        marginLeft: 15,
        fontSize: 16,
      },
});



export default PostHeader;

