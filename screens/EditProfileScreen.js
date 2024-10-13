import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { setUser } from '../store/slice/userSlice'; // setUser 액션 가져오기
import Header from '../components/profile/editProfile/Header';
import EditForm from '../components/profile/editProfile/EditForm';

const EditProfileScreen = ({route, navigation}) => {
	const dispatch = useDispatch();
	const auth = getAuth();
	const db = getFirestore();
	const currentUser = useSelector(state => state.user.user);

	const { 
		name, 
		userId, 
		profileImg, 
		birthdate, 
		phone, 
		mbti, 
		personality 
	} = route.params;

	const handleSave = async (updatedProfile) => {
		console.log('updatedProfile', updatedProfile);
		try {
			const user = auth.currentUser;
			if (user) {
				// Firebase Firestore 업데이트
				const userRef = doc(db, 'users', user.uid);
				await updateDoc(userRef, {
					profile : {
						userName: updatedProfile.name,
						birthdate: updatedProfile.birthdate,
						mbti: updatedProfile.mbti,
						personality: updatedProfile.personality,
					},
					userId: updatedProfile.userId,
					profileImg: updatedProfile.profileImg,
					userPhone: updatedProfile.phone,
				});

				// Redux 상태 업데이트
				const updatedUser = { ...currentUser, ...updatedProfile };
				dispatch(setUser(updatedUser));

				console.log('프로필이 성공적으로 업데이트되었습니다.');
				navigation.goBack();
			}
		} catch (error) {
			console.error('프로필 업데이트 중 오류 발생:', error);
			alert('프로필 업데이트에 실패했습니다. 다시 시도해 주세요.');
		}
	};

	return (
		<SafeAreaView style={styles.safe}>
			<Header name={name} navigation={navigation} onSave={handleSave} />
			<ScrollView showsVerticalScrollIndicator={false}>
				<EditForm
					name={name}
					userId={userId}
					profileImg={profileImg}
					birthdate={birthdate}
					phone={phone}
					mbti={mbti}
					personality={personality}
					onSave={handleSave}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		paddingTop: Platform.OS === 'android' ? 25 : 0,
		backgroundColor: '#fff',
	}
});

export default EditProfileScreen;
