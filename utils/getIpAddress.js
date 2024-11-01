// import DeviceInfo from 'react-native-device-info';
// import { Platform } from 'react-native';

// export const getDeviceIPAddress = async () => {
//   console.log('getDeviceIPAddress > 실행');
//   try {
//     const platform = Platform.OS;
//     let ip = null;

//     switch (platform) {
//       case 'ios':
//         // iOS의 경우
//         ip = await DeviceInfo.getIpAddress();
//         console.log('getDeviceIPAddress > iOS IP:', ip);
//         break;

//       case 'android':
//         // Android의 경우
//         if (__DEV__ && (await DeviceInfo.isEmulator())) {
//           // 에뮬레이터인 경우 (ADB)
//           ip = '10.0.2.2'; // Android 에뮬레이터 기본 localhost IP
//           console.log('getDeviceIPAddress > Android Emulator IP:', ip);
//         } else {
//           // 실제 안드로이드 디바이스
//           ip = await DeviceInfo.getIpAddress();
//           console.log('getDeviceIPAddress > Android Device IP:', ip);
//         }
//         break;

//       default:
//         console.log('getDeviceIPAddress > Unsupported platform');
//         return null;
//     }

//     // IPv4 형식 확인
//     if (ip && ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
//       console.log('getDeviceIPAddress > IPv4 형식 확인 성공');
//       return ip;
//     }

//     return null;
//   } catch (error) {
//     console.error('getDeviceIPAddress > IP 주소 가져오기 실패:', error);
//     console.error('getDeviceIPAddress > 플랫폼:', Platform.OS);
//     console.error('getDeviceIPAddress > 개발 모드:', __DEV__);
//     return null;
//   }
// };

// // 사용 예시:
// // const baseURL = await getDeviceIPAddress();
// // const apiUrl = `http://${baseURL}:8000/api`;
