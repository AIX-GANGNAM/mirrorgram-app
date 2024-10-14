
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../firebaseConfig';

import {useSelector} from 'react-redux';

const db = getFirestore(app);
const auth = getAuth(app);

export const POSTS = async () => {
  // const user = auth.currentUser;
  // if (!user) {
  //   console.log('No user logged in');
  //   return [];
  // }
  const user = useSelector((state) => state.user.user);

  console.log('post 값을 혹인해보자',user);
  const postsRef = collection(db, 'feeds');
  const q = query(postsRef, where('userId', '==', user.uid));
  const querySnapshot = await getDocs(q);

  console.log(querySnapshot);

  
  const posts = [];
  querySnapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() });
  });

  console.log(posts);
  return posts;
};

export default POSTS;