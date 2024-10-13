import React, { useState } from 'react';
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

	const [updatedProfile, setUpdatedProfile] = useState(route.params);

	const handleFormChange = (newData) => {
		setUpdatedProfile(prevData => ({...prevData, ...newData}));
	};

	const handleSave = async () => {
		console.log('updatedProfile', updatedProfile);
		try {
			const user = auth.currentUser;
			if (user) {
				const userRef = doc(db, 'users', user.uid);
				
				const updateData = {
					profile: {
						userName: updatedProfile.name,
						birthdate: updatedProfile.birthdate,
					},
					userId: updatedProfile.userId,
					userPhone: updatedProfile.phone,
				};

				if (updatedProfile.mbti) updateData.profile.mbti = updatedProfile.mbti;
				if (updatedProfile.personality) updateData.profile.personality = updatedProfile.personality;
				if (updatedProfile.profileImg) updateData.profileImg = updatedProfile.profileImg;

				console.log('Updating with data:', updateData);
				await updateDoc(userRef, updateData);

				// Redux 상태 업데이트
				const updatedUserData = {
					...currentUser,
					...updatedProfile,
					profile: {
						...currentUser.profile,
						...updateData.profile
					}
				};
				dispatch(setUser(updatedUserData));

				console.log('프로필이 성공적으로 업데이트되었습니다.');
				console.log('Updated Redux State:', updatedUserData);
				navigation.goBack();
			}
		} catch (error) {
			console.error('프로필 업데이트 중 오류 발생:', error);
			alert('프로필 업데이트에 실패했습니다. 다시 시도해 주세요.');
		}
	};

	return (
		<SafeAreaView style={styles.safe}>
			<Header navigation={navigation} onSave={handleSave} />
			<ScrollView showsVerticalScrollIndicator={false}>
				<EditForm
						{...updatedProfile}
						onSave={handleFormChange}
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
