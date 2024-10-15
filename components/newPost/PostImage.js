import { StyleSheet } from 'react-native';
import { Pressable, Image } from 'react-native';

const PostImage = ({post}) => {
    
      return(
       <Pressable style={{marginHorizontal: 8, padding:5}}>
            <Image style={styles.postImg} 
            source={post.image ? {uri: post.image} : require('../../assets/no-image.png')} />
        </Pressable>
      );
    }

const styles = StyleSheet.create({
    postImg: {
        resizeMode: 'cover',
        height: 300,
        width: '100%',
        borderRadius: 10,
       },
});

export default PostImage;

