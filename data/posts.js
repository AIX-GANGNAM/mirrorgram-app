import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

export const POSTS = async (currentUserUid) => {
  if (!currentUserUid) {
    console.log('사용자 UID가 제공되지 않았습니다.');
    return [];
  }

  try {
    const postsRef = collection(db, 'feeds');
    const q = query(postsRef, where('userId', '==', currentUserUid));
    const querySnapshot = await getDocs(q);

    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ ...doc.data() });
    });

    console.log('필터링된 게시물:', posts);
    return posts;
  } catch (error) {
    console.error('게시물 가져오기 오류:', error);
    return [];
  }
};

export default POSTS;
