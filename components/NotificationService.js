import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import PushNotification from 'react-native-push-notification';
import {setSubscriber} from './HelperFunction';
import {useNavigation} from '@react-navigation/native';

export async function requestUserPermission(type) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFCMToken(type);
  }
}

const getFCMToken = async (type) => {
  // await AsyncStorage.removeItem('fcmToken');
  let fcmToken = await AsyncStorage.getItem(type + 'fcmToken');
  console.log(fcmToken, 'the old Token');
  if (!fcmToken) {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log(fcmToken, 'the new generated token');
        const {currentUser} = auth();
        firestore()
          .collection('controllerNotificationToken')
          .doc(currentUser.uid)
          .set(
            {
              token: firestore.FieldValue.arrayUnion(fcmToken),
              type: type,
            },
            {merge: true},
          )
          .then(() => {
            console.log('Token added!');
          });
        await AsyncStorage.setItem(type + 'fcmToken', fcmToken);
      }
    } catch (error) {
      console.log(error, 'error raied in fcmToken');
    }
  }
};

export const notificationListener = async () => {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log(
      'Notificaton caused app to open from background state:',
      remoteMessage.notification,
    );
  });
  messaging().onMessage(async (remoteMessage) => {
    console.log('recieved in foreground', remoteMessage);
    PushNotification.localNotification({
      channelId: 'ybcontroller',
      autoCancel: true,
      title: remoteMessage.notification.title,
      message: remoteMessage.notification.body,
      vibrate: true,
      vibration: 300,
      playSound: true,
      soundName: 'ybsound.wav',
      icon:
        'https://firebasestorage.googleapis.com/v0/b/yellow-road-rangers.appspot.com/o/ic_launcher.png?alt=media&token=5a8497c5-4a43-4316-a88d-04462f50be33',
    });
    // PushNotification.localNotification({
    //   channelId: 'ybcontroller',
    //   autoCancel: true,
    //   title: remoteMessage.data.title,
    //   message: remoteMessage.data.body,
    //   vibrate: true,
    //   vibration: 300,
    //   playSound: true,
    //   soundName: 'default',
    //   icon:
    //     'https://firebasestorage.googleapis.com/v0/b/yellow-road-rangers.appspot.com/o/ic_launcher.png?alt=media&token=5a8497c5-4a43-4316-a88d-04462f50be33',
    // });
  }),
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to popen from quit state:',
          remoteMessage.notification,
        );
        const navigation = useNavigation();
      }
    });
};
