import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// 백그라운드 작업 정의
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background Notification Task Error:', error);
    return;
  }

  const notification = data.notification;
  console.log('Received background notification:', notification);
});

// 푸시 알림 백그라운드 작업 등록
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
