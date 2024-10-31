import React, { useState, useEffect } from 'react';
import { View, Image, Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

    // 맵 매트릭스 정의
    const mapMatrix = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 2, 2, 2, 0, 0, 0, 3, 3, 3, 3, 0, 1],
        [1, 0, 2, 2, 2, 0, 1, 1, 3, 3, 3, 3, 0, 1],
        [1, 0, 2, 8, 2, 0, 1, 1, 3, 3, 8, 3, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 4, 4, 4, 0, 0, 6, 6, 6, 0, 1],
        [1, 0, 0, 0, 4, 4, 4, 0, 0, 6, 6, 6, 0, 1],
        [1, 0, 0, 0, 4, 8, 4, 0, 0, 8, 6, 6, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 7, 7, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 7, 7, 7, 7, 0, 0, 5, 5, 0, 0, 0, 1],
        [1, 0, 7, 7, 7, 7, 0, 0, 5, 5, 1, 1, 0, 1],
        [1, 0, 7, 8, 7, 7, 0, 0, 8, 5, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 9, 9, 9, 9, 0, 0,10,10,10, 0, 1],
        [1, 0, 0, 9, 9, 9, 9, 0, 0,10,10,10, 0, 1],
        [1, 0, 0, 9, 9, 8, 9, 0, 0, 8,10,10, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 1, 1, 1, 0, 0, 0,11,11, 8,11, 1, 1],
        [1, 0, 1, 1, 1, 0, 0, 1,11,11,11,11, 1, 1],
        [1, 0, 1, 1, 1, 0, 0, 1,11,11,11,11, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // ... 맵에 맞게 계속 정의
      ];
      
      // 타일 크기 정의
      const Tile_HEIGHT = 33; // 픽셀 단위
      const Tile_WIDTH = 30;
      // 맵 타일 타입에 따른 색상 정의
const TILE_COLORS = {
    0: 'rgba(0, 255, 0, 0.2)',    // 이동 가능 구역 (초록색)
    1: 'rgba(255, 0, 0, 0.3)',    // 이동 불가 구역 (빨간색)
    2: 'rgba(0, 0, 255, 0.3)',    // 물 구역 (파란색)
    3: 'cyan', // 입구 구역 (회색)
    4: 'rgba(255, 255, 0, 0.3)',   // 특별 구역 (노란색)
    5: 'rgba(255, 0, 255, 0.3)',   // 이벤트 구역 (보라색)
    8: 'black'
    // 필요한 만큼 추가
  };
  
  // 타일 타입별 설명
  const TILE_DESCRIPTIONS = {
    0: '이동 가능',
    1: '이동 불가',
    2: '물 구역',
    3: '절벽',
    4: '특별 구역',
    5: '이벤트 구역',
    // 필요한 만큼 추가
  };

export default function Village() {



  
  const [characters, setCharacters] = useState([
    {
      id: 1,
      position: new Animated.ValueXY({ 
        x: Tile_WIDTH,  // 첫 번째 이동 가능한 타일 위치
        y: Tile_HEIGHT
      }),
      image: require('../../assets/character1.png'),
    }
  ]);

  const moveDistance = {
    x: Tile_WIDTH,
    y: Tile_HEIGHT
  }; 

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
    const character = characters[0];
    const currentX = character.position.x._value;
    const currentY = character.position.y._value;
    
    const matrixX = Math.floor(currentX / Tile_WIDTH);
    const matrixY = Math.floor(currentY / Tile_HEIGHT);
    
    let newX = currentX;
    let newY = currentY;
    let targetX = matrixX;
    let targetY = matrixY;
    let canMove = false;

    switch (moveDirection) {
      case 'up':
        newY = currentY - moveDistance.y;
        targetY = matrixY - 1;
        break;
      case 'down':
        newY = currentY + moveDistance.y;
        targetY = matrixY + 1;
        break;
      case 'left':
        newX = currentX - moveDistance.x;
        targetX = matrixX - 1;
        break;
      case 'right':
        newX = currentX + moveDistance.x;
        targetX = matrixX + 1;
        break;
    }

    canMove = checkCollision(targetX, targetY);

    if (canMove) {
      setDirection(moveDirection);
      setIsMoving(true);
      moveCharacter(character.id, newX, newY);

      if (checkEntrance(targetX, targetY)) {
        setTimeout(() => {
          handleEnterBuilding(targetX, targetY);
        }, 300);
      }

      setTimeout(() => {
        setIsMoving(false);
        setCurrentFrame(0);
      }, 300);
    }
  };

  // 충돌 감지 함수
  const checkCollision = (x, y) => {
    // 맵 경계 체크
    if (x < 0 || x >= mapMatrix[0].length || y < 0 || y >= mapMatrix.length) {
      return false;
    }
    
    const tileType = mapMatrix[y][x];
    // 0은 이동 가능, 8은 출입구
    return tileType === 0 || tileType === 8;
  };

  // 건물 진입 처리 함수 수정
  const handleEnterBuilding = (x, y) => {
    // 각 출입구의 위치와 해당하는 건물 확인
    if (y === 3) {
      if (x === 3) {
        // Joy's Home 출입구
        console.log("Joy's Home에 진입했습니다.");
        // navigation.navigate('JoyHome');
      } else if (x === 10) {
        // Anger's Home 출입구
        console.log("Anger's Home에 진입했습니다.");
        // navigation.navigate('AngerHome');
      }
    } else if (y === 7) {
      if (x === 5) {
        // Sadness's Home 출입구
        console.log("Sadness's Home에 진입했습니다.");
        // navigation.navigate('SadnessHome');
      } else if (x === 9) {
        // Shopping Center 출입구
        console.log("Shopping Center에 진입했습니다.");
        // navigation.navigate('ShoppingCenter');
      }
    } else if (y === 12) {
      if (x === 3) {
        // Discussion Room 출입구
        console.log("Discussion Room에 진입했습니다.");
        // navigation.navigate('DiscussionRoom');
      } else if (x === 8) {
        // Fear's Home 출입구
        console.log("Fear's Home에 진입했습니다.");
        // navigation.navigate('FearHome');
      }
    } else if (y === 16) {
      if (x === 5) {
        // Cafe 출입구
        console.log("Cafe에 진입했습니다.");
        // navigation.navigate('Cafe');
      } else if (x === 9) {
        // 영화관 출입구
        console.log("영화관에 진입했습니다.");
        // navigation.navigate('Cinema');
      }
    } else if (y === 18 && x === 10) {
      // Restaurant 출입구
      console.log("Restaurant에 진입했습니다.");
      // navigation.navigate('Restaurant');
    }
  };

  // 건물 타입 확인 함수 추가
  const getBuildingType = (x, y) => {
    const tileType = mapMatrix[y][x];
    switch (tileType) {
      case 2:
        return 'Joy_home';
      case 3:
        return 'Anger_home';
      case 4:
        return 'Sadness_home';
      case 5:
        return 'Fear_home';
      case 6:
        return 'Shopping_center';
      case 7:
        return 'Discussion_room';
      case 9:
        return 'Cafe';
      case 10:
        return 'Cinema';
      case 11:
        return 'Restaurant';
      default:
        return null;
    }
  };

  // checkEntrance 함수 수정 (선택사항: 출입구 근처에서만 진입 가능하도록)
  const checkEntrance = (x, y) => {
    if (x < 0 || x >= mapMatrix[0].length || y < 0 || y >= mapMatrix.length) {
      return false;
    }
    
    if (mapMatrix[y][x] === 8) {
      // 주변 타일 확인하여 어떤 건물의 출입구인지 체크
      const surroundingTiles = [
        { x: x-1, y: y },
        { x: x+1, y: y },
        { x: x, y: y-1 },
        { x: x, y: y+1 }
      ];

      for (const tile of surroundingTiles) {
        const buildingType = getBuildingType(tile.x, tile.y);
        if (buildingType) {
          return true;
        }
      }
    }
    return false;
  };

  // 캐릭터 이동 로직 수정
  const moveCharacter = (characterId, newX, newY) => {
    Animated.timing(characters.find(c => c.id === characterId).position, {
      toValue: { 
        x: Math.round(newX / Tile_WIDTH) * Tile_WIDTH, 
        y: Math.round(newY / Tile_HEIGHT) * Tile_HEIGHT
      },
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // 맵 컴포넌트 내부에 추가
  const MatrixOverlay = () => {
    return (
      <View style={styles.matrixOverlay}>
        {mapMatrix.map((row, y) => (
          <View key={y} style={styles.matrixRow}>
            {row.map((cell, x) => (
              <View
                key={`${x}-${y}`}
                style={[
                  styles.matrixCell,
                  {
                    backgroundColor: TILE_COLORS[cell] || 'rgba(0, 0, 0, 0.2)', // 정의되지 않은 숫자는 검정색으로
                  }
                ]}
              >
                <Text style={styles.coordText}>
                  {`${x},${y}\n${cell}`}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // 스케줄 데이터 타입 정의
  const scheduleData = [
    {'type': 'activity', 'activity': '명상과 간단한 스트레칭', 'location': [1, 2], 'duration': 30, 'zone': 'Joy_home'}, 
    {'type': 'activity', 'activity': '아침 식사를 하며 하루의 계획 세우기', 'location': [1, 2], 'duration': 30, 'zone': 'Joy_home'}, 
    {'type': 'movement', 'path': [[1, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [8, 4], [8, 5], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [13, 5], [13, 4], [13, 3], [12, 3], [11, 3], [10, 3]], 'start_zone': 'Joy_home', 'end_zone': 'Discussion Room', 'duration': 22}, 
    {'type': 'activity', 'activity': '자원봉사 활동에 참여하거나 친구들과 만남', 'location': [10, 3], 'duration': 240, 'zone': 'Discussion Room'}, 
    {'type': 'movement', 'path': [[10, 3], [11, 3], [12, 3], [13, 3], [13, 4], [13, 5], [13, 6], [13, 7], [13, 8], [14, 8], [15, 8], [16, 8], [16, 9], [17, 9], [17, 10], [18, 10], [18, 9]], 'start_zone': 'Discussion Room', 'end_zone': 'Restaurant', 'duration': 16}, 
    {'type': 'activity', 'activity': '점심 먹기', 'location': [18, 9], 'duration': 60, 'zone': 'Restaurant'}, 
    {'type': 'movement', 'path': [[18, 9], [18, 10], [17, 10], [17, 9], [16, 9], [16, 8], [15, 8], [14, 8], [13, 8], [13, 7], [13, 6], [13, 5], [13, 4], [13, 3], [12, 3], [11, 3], [10, 3]], 'start_zone': 'Restaurant', 'end_zone': 'Discussion Room', 'duration': 16}, 
    {'type': 'activity', 'activity': '오후에도 자원봉사나 사회적 활동 계속하기', 'location': [10, 3], 'duration': 240, 'zone': 'Discussion Room'}, 
    {'type': 'movement', 'path': [[10, 3], [11, 3], [12, 3], [13, 3], [13, 4], [13, 5], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 6], [8, 5], [8, 4], [8, 3], [7, 3], [6, 3], [5, 3], [4, 3], [3, 3], [2, 3]], 'start_zone': 'Discussion Room', 'end_zone': 'Joy_home', 'duration': 20}, 
    {'type': 'activity', 'activity': '집에 돌아와 독서나 창작 활동', 'location': [2, 3], 'duration': 120, 'zone': 'Joy_home'}, 
    {'type': 'movement', 'path': [[2, 3], [3, 3], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [16, 9], [17, 9], [17, 10], [18, 10]], 'start_zone': 'Joy_home', 'end_zone': 'Restaurant', 'duration': 23}, 
    {'type': 'activity', 'activity': '저녁 식사', 'location': [18, 10], 'duration': 60, 'zone': 'Restaurant'}, 
    {'type': 'movement', 'path': [[18, 10], [17, 10], [17, 9], [16, 9], [16, 8], [15, 8], [14, 8], [13, 8], [13, 7], [13, 6], [13, 5], [13, 4], [13, 3], [12, 3], [11, 3], [10, 3]], 'start_zone': 'Restaurant', 'end_zone': 'Discussion Room', 'duration': 15}, 
    {'type': 'activity', 'activity': '친구들과의 영상 통화나 소셜 미디어 소통', 'location': [10, 3], 'duration': 60, 'zone': 'Discussion Room'}, 
    {'type': 'movement', 'path': [[10, 3], [11, 3], [12, 3], [13, 3], [13, 4], [13, 5], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 6], [8, 5], [8, 4], [8, 3], [7, 3], [6, 3], [5, 3], [4, 3], [3, 3], [2, 3]], 'start_zone': 'Discussion Room', 'end_zone': 'Joy_home', 'duration': 20}, 
    {'type': 'activity', 'activity': '편안한 음악을 듣거나 명상하며 하루 마무리', 'location': [2, 3], 'duration': 60, 'zone': 'Joy_home'}, 
    {'type': 'activity', 'activity': '취침 준비 및 독서', 'location': [2, 3], 'duration': 30, 'zone': 'Joy_home'}
]
  // 시간 스케일 조정 (120분의 1)
  const TIME_SCALE = 1/120;

  // 스케줄 실행을 위한 상태 추가
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [isScheduleRunning, setIsScheduleRunning] = useState(false);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  // 스케줄 실행 함수
  const executeSchedule = async () => {
    const schedule = scheduleData[currentScheduleIndex];
    
    if (schedule.type === 'activity') {
      // 활동 실행
      console.log(`${schedule.activity} 시작 (${schedule.duration * TIME_SCALE}분)`);
      await new Promise(resolve => setTimeout(resolve, schedule.duration * TIME_SCALE * 1000));
      moveToNextSchedule();
    } else if (schedule.type === 'movement') {
      // 이동 실행
      moveAlongPath(schedule.path);
    }
  };

  // 경로를 따라 이동하는 함수
  const moveAlongPath = async () => {
    const schedule = scheduleData[currentScheduleIndex];
    const path = schedule.path;
    
    if (currentPathIndex < path.length - 1) {
      const currentPos = path[currentPathIndex];
      const nextPos = path[currentPathIndex + 1];
      
      // 이동 방향 결정
      let moveDirection;
      if (nextPos[0] > currentPos[0]) moveDirection = 'right';
      else if (nextPos[0] < currentPos[0]) moveDirection = 'left';
      else if (nextPos[1] > currentPos[1]) moveDirection = 'down';
      else if (nextPos[1] < currentPos[1]) moveDirection = 'up';
      
      // 이동 실행
      handleMove(moveDirection);
      
      // 다음 위치로 이동
      setTimeout(() => {
        setCurrentPathIndex(currentPathIndex + 1);
      }, 300); // 이동 애니메이션 시간
    } else {
      // 경로 이동 완료
      setCurrentPathIndex(0);
      moveToNextSchedule();
    }
  };

  // 다음 스케줄로 이동
  const moveToNextSchedule = () => {
    if (currentScheduleIndex < scheduleData.length - 1) {
      setCurrentScheduleIndex(currentScheduleIndex + 1);
    } else {
      setIsScheduleRunning(false);
      console.log('일과 완료');
    }
  };

  // 스케줄 시작 버튼 추가
  const startSchedule = () => {
    setIsScheduleRunning(true);
    setCurrentScheduleIndex(0);
    setCurrentPathIndex(0);
  };

  // useEffect로 스케줄 실행 감시
  useEffect(() => {
    if (isScheduleRunning) {
      executeSchedule();
    }
  }, [currentScheduleIndex, isScheduleRunning]);

  // useEffect로 경로 이동 감시
  useEffect(() => {
    if (isScheduleRunning && scheduleData[currentScheduleIndex]?.type === 'movement') {
      moveAlongPath();
    }
  }, [currentPathIndex, isScheduleRunning]);

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
  source={require('../../assets/character/purple.png')}
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
      {/* <View style={styles.controls}>
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
      </View> */}
      {/* <MatrixOverlay /> */}
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={startSchedule}
        disabled={isScheduleRunning}
      >
        <Text style={styles.startButtonText}>
          {isScheduleRunning ? '실행 중...' : '일과 시작'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  matrixOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,  // 맵 위에 표시되도록
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixCell: {
    width: Tile_WIDTH,
    height: Tile_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  legendText: {
    color: 'white',
    fontSize: 12,
  },
  coordText: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  startButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 255, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
  },
});