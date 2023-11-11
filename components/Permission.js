import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {requestMultiple, PERMISSIONS} from 'react-native-permissions';
export default function Permission(props) {
  const backCount = useRef(0);
  const requestCameraPermission = async () => {
    try {
      requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
      ]).then((statuses) => {
        if (
          statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] ==
            'granted' &&
          statuses[PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION] == 'granted'
        ) {
          props.navigation.navigate('Dashboard');
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);
  const handleBackButton = () => {
    if (backCount.current == 1) {
      backCount.current = 0;
      BackHandler.exitApp();
      return true;
    } else {
      backCount.current = 1;
      ToastAndroid.showWithGravityAndOffset(
        'Press again to quit the application',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
      setTimeout(() => {
        backCount.current = 0;
      }, 2000);

      return true;
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Image
          style={{width: 80, height: 80}}
          resizeMode="contain"
          source={require('../assets/icon.jpeg')}
        />
        <Text
          style={{
            fontSize: Dimensions.get('window').width / 25,
            fontFamily: 'sans-serif-condensed',
            padding: 10,
            textAlign: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            color: 'black',
          }}>
          Welcome to Yellow Bull Controller
        </Text>
        <Text
          style={{
            fontSize: Dimensions.get('window').width / 28,
            fontFamily: 'sans-serif-condensed',
            padding: 10,
            alignItems: 'center',
            color: 'black',
          }}>
          To provide you a hassle-free connection with the booking user, we need
          the following permissions:
        </Text>
        <Text
          style={{
            fontSize: Dimensions.get('window').width / 28,
            fontFamily: 'sans-serif-condensed',
            padding: 10,
            alignItems: 'center',
            paddingTop: 15,
            color: 'black',
          }}>
          -Location (to allow the user to see your current location even when
          the app is in background/in use/not in use/closed)
        </Text>
        <Text
          style={{
            fontSize: Dimensions.get('window').width / 28,
            fontFamily: 'sans-serif-condensed',
            padding: 10,
            alignItems: 'center',
            paddingTop: 15,
            color: 'black',
          }}>
          -Physical activity (to allow the user to track your location even when
          the app is in background/in use/not in use/closed)
        </Text>
        <Text
          style={{
            fontSize: Dimensions.get('window').width / 28,
            fontFamily: 'sans-serif-condensed',
            padding: 10,
            fontWeight: 'bold',
            alignItems: 'center',
            paddingTop: 15,
            color: 'black',
          }}>
          Note: You won't be able to continue, until you grant the permissions.
        </Text>
      </View>
      <View>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={requestCameraPermission}>
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontSize: Dimensions.get('window').width / 20,
              fontFamily: 'sans-serif-condensed',
              fontWeight: '700',
              padding: 10,
            }}>
            I Accept
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    marginBottom: 10,
    backgroundColor: 'rgb(250, 204, 4)',
    width: Dimensions.get('window').width - 100,
  },
});
