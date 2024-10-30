import React, { useState, useEffect } from 'react';
import { View, Image, Animated, TouchableOpacity, Text } from 'react-native';

export default function Village() {

  
  const [characters, setCharacters] = useState([
    {
      id: 1,
      position: new Animated.ValueXY({ x: 50, y: 50 }),
      image: require('../../assets/character1.png'),
    }
  ]);

  const moveDistance = 20; // 한 번에 이동할 거리

  const [currentFrame, setCurrentFrame] = useState(0);
  const [direction, setDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false); // 움직임 상태 추가

  // 스프라이트 설정 수정
  const spriteConfig = {
    frameWidth: 30,  // 실제 프레임 크기에 맞게 조정
    frameHeight: 33,
    animations: {
      down_idle: { row: 0, frames: 3 },  // idle 애니메이션은 3프레임
      down: { row: 4, frames: 10 },
      left_idle: { row: 1, frames: 3 },
      left: { row: 5, frames: 10 },
      right_idle: { row: 3, frames: 3 },
      right: { row: 7, frames: 10 },
      up_idle: { row: 2, frames: 1 },
      up: { row: 6, frames: 10 },
    }
  };

  // 애니메이션 효과 수정
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentFrame((prev) => {
        const maxFrames = spriteConfig.animations[
          isMoving ? direction : `${direction}_idle`
        ].frames;
        return (prev + 1) % maxFrames;
      });
    }, isMoving ? 50 : 200);  // 움직일 때는 더 빠르게, idle일 때는 천천히

    return () => clearInterval(animationInterval);
  }, [isMoving, direction]);

  const handleMove = (moveDirection) => {
    setDirection(moveDirection);
    setIsMoving(true);
    
    const character = characters[0];
    const currentX = character.position.x._value;
    const currentY = character.position.y._value;

    // 이동 로직
    switch (moveDirection) {
      case 'up':
        moveCharacter(character.id, currentX, currentY - moveDistance);
        break;
      case 'down':
        moveCharacter(character.id, currentX, currentY + moveDistance);
        break;
      case 'left':
        moveCharacter(character.id, currentX - moveDistance, currentY);
        break;
      case 'right':
        moveCharacter(character.id, currentX + moveDistance, currentY);
        break;
    }

    // 이동 애니메이션이 끝나면 idle 상태로 전환
    setTimeout(() => {
      setIsMoving(false);
      setCurrentFrame(0);  // 프레임 초기화
    }, 300);  // 이동 시간 조정
  };

  // 캐릭터 이동 로직 수정
  const moveCharacter = (characterId, newX, newY) => {
    Animated.timing(characters.find(c => c.id === characterId).position, {
      toValue: { x: newX, y: newY },
      duration: 300,  // spring 대신 timing 사용하여 일정한 속도로 이동
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* 배경 맵 */}
      <Image 
        source={require('../../assets/map-background.gif')}
        style={styles.mapBackground}
      />
      
      {/* 캐릭터들 */}
      {characters.map((character) => (
        <Animated.View
          key={character.id}
          style={[
            styles.character,
            { 
              transform: character.position.getTranslateTransform(),
              width: spriteConfig.frameWidth,  // 한 프레임의 너비
              height: spriteConfig.frameHeight, // 한 프레임의 높이
              overflow: 'hidden',  // 중요: 프레임 밖의 부분을 잘라냄
              position: 'absolute'
            }
          ]}
        >
          <Image
  source={require('../../assets/jelda.png')}
  style={{
    width: spriteConfig.frameWidth * 10,
    height: spriteConfig.frameHeight * 8,
    position: 'absolute',
    left: -spriteConfig.frameWidth * currentFrame,
    top: -spriteConfig.frameHeight * spriteConfig.animations[
      isMoving ? direction : `${direction}_idle`
    ].row,
  }}
/>
        </Animated.View>
      ))}
      
      {/* 방향키 컨트롤러 */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => handleMove('up')}>
          <Text>↑</Text>
        </TouchableOpacity>
        <View style={styles.horizontalControls}>
          <TouchableOpacity style={styles.button} onPress={() => handleMove('left')}>
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleMove('down')}>
            <Text>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleMove('right')}>
            <Text>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  character: {
    position: 'absolute',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
};