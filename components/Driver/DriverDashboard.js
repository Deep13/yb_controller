import React, {Component, useState} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Dimensions,
  BackHandler,
  Linking,
  ActivityIndicator,
  Modal,
  Platform,
  ToastAndroid,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import {setSubscriber, signOutMain} from '../HelperFunction';
import PushNotification, {Importance} from 'react-native-push-notification';
import Geolocation from '@react-native-community/geolocation';
import {
  requestUserPermission,
  notificationListener,
} from '../NotificationService';
import {
  requestMultiple,
  PERMISSIONS,
  checkMultiple,
} from 'react-native-permissions';
import BackgroundGeolocation from 'react-native-background-geolocation';
import Dialog, {
  ScaleAnimation,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogButton,
} from 'react-native-popup-dialog';
export default class DriverDashboard extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.handleBackButton = this.handleBackButton.bind(this);
    this.amount = React.createRef();
    this.state = {
      driverDetails: null,
      navigation: props.navigation,
      completedModal: false,
      inValidText: '',
      loading: true,
      data: null,
      amountIsError: false,
      amount: null,
      paymentIsError: false,
      payment: null,
      disclaimer: false,
      allPerm: 0,
    };
  }
  getData = () => {
    const {currentUser} = auth();
    this.setState({
      loading: true,
    });
    firestore()
      .collection('Controller')
      .doc(currentUser.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          this.setState({
            driverDetails: documentSnapshot.data(),
          });
        } else {
          Alert.alert('Alert', 'No data found');
        }
      })
      .catch((err) => {
        console.log(err);
        Alert.alert('Alert', 'get data ' + JSON.stringify(err));
      });
    setSubscriber(
      firestore()
        .collection('Transaction')
        .where('servStatus', '<', 6)
        .where('driverDetails.status', '==', 0)
        .where('driverDetails.userId', '==', currentUser.uid)
        .onSnapshot(
          (querySnapshot) => {
            var aData;

            querySnapshot.forEach((documentSnapshot) => {
              aData = documentSnapshot.data();
              aData.id = documentSnapshot.id;
            });
            console.log(aData);
            this.setState({data: aData, loading: false});
          },
          (error) => {
            console.log('DashboardDriver', error);
            // Alert.alert(
            //   'Alert',
            //   'driver transaction error' + JSON.stringify(error),
            // );
            this.setState({loading: false});
          },
        ),
    );
    BackgroundGeolocation.onLocation(this.onLocation.bind(this), this.onError);

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.onMotionChange(this.onMotionChange);

    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.onActivityChange(this.onActivityChange);

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.onProviderChange(this.onProviderChange);

    ////
    // 2.  Execute #ready method (required)
    //
    BackgroundGeolocation.ready(
      {
        // Geolocation Config
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 10,
        // Activity Recognition
        stopTimeout: 1,
        // Application config
        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
        startOnBoot: true, // <-- Auto start tracking when device is powered-up.
        batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
        autoSync: false,
      },
      (state) => {
        console.log(
          '- BackgroundGeolocation is configured and ready: ',
          state.enabled,
        );

        if (!state.enabled) {
          BackgroundGeolocation.start(function () {
            console.log('- Start success');
          });
        }
      },
    );
  };

  requestCameraPermission = () => {
    try {
      requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
      ]).then((statuses) => {
        if (
          statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] ==
            'granted' &&
          statuses[PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION] == 'granted' &&
          statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] == 'granted'
        ) {
          this.setState({allPerm: 2});
          this.getData();
        } else {
          var str =
            'Background Location access: ' +
            statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] +
            '  ' +
            'ACTIVITY_RECOGNITION access: ' +
            statuses[PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION] +
            '  ' +
            'ACCESS_FINE_LOCATION access: ' +
            statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

          Alert.alert('Alert', str);
          this.setState({allPerm: 2});
          this.getData();
        }
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Alert', 'permission error' + JSON.stringify(err));
    }
  };
  signOut = async () => {
    await signOutMain('Driver');
    console.log('User signed out!');
    BackgroundGeolocation.removeListeners();

    this.state.navigation.navigate('Login');
  };
  LocalNotification = () => {
    PushNotification.localNotification({
      channelId: 'ybcontroller',
      autoCancel: true,
      bigText:
        'This is local notification demo in React Native app. Only shown, when expanded.',
      subText: 'Local Notification Demo',
      title: 'Local Notification Title',
      message: 'Expand me to see more',
      vibrate: true,
      vibration: 300,
      playSound: true,
      soundName: 'default',
      actions: '["Yes", "No"]',
    });
  };
  componentDidMount = () => {
    const {currentUser} = auth();

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    checkMultiple([
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
    ]).then((statuses) => {
      if (
        statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] == 'granted' &&
        statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] == 'granted' &&
        statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] == 'granted'
      ) {
        this.setState({allPerm: 2});
        this.getData();
        // setallPerm(2);
      } else {
        console.log('no permission');
        // setallPerm(1);
        this.setState({allPerm: 1});
      }
    });

    PushNotification.createChannel(
      {
        channelId: 'ybcontroller', // (required)
        channelName: 'My channel', // (required)
        channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: 'ybsound', // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );
    requestUserPermission('Driver');

    notificationListener();
    // this.LocalNotification();
    // You must remove listeners when your component unmounts
  };
  handleBackButton = () => {
    if (this.state.backCount == 1) {
      this.setState({backCount: 0});
      BackHandler.exitApp();
      return true;
    } else {
      this.setState({backCount: 1});
      ToastAndroid.showWithGravityAndOffset(
        'Press again to quit the application',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
      setTimeout(() => {
        this.setState({backCount: 0});
      }, 2000);

      return true;
    }
  };
  componentWillUnmount() {
    console.log('gone');
    BackgroundGeolocation.removeListeners();
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  onLocation(location) {
    console.log('[location] -', location.coords);
    if (
      this.state.data &&
      this.state.data.servStatus > 2 &&
      this.state.data.servStatus < 5
    ) {
      firestore()
        .collection('Transaction')
        .doc(this.state.data.id)
        .update({
          liveLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading,
          },
        })
        .then(
          () => {},
          (error) => {
            console.log(error);
          },
        )
        .catch((error) => {
          console.log(error);
        });
    }
  }
  onError(error) {
    console.log('[location] ERROR -', error);
  }
  onActivityChange(event) {
    console.log('[activitychange] -', event); // eg: 'on_foot', 'still', 'in_vehicle'
  }
  onProviderChange(provider) {
    // this.setState({enabled: false});
    console.log('[providerchange] -', provider.enabled, provider.status);
  }
  onMotionChange(event) {
    console.log('[motionchange] -', event.isMoving, event.location);
  }
  navigateFrom = () => {
    Linking.openURL(
      'https://www.google.com/maps/dir/?api=1&destination=' +
        this.state.data.loc_from.address.replace(' ', '+') +
        '&travelmode=driving&dir_action=navigate',
    );
  };
  navigateTo = () => {
    Linking.openURL(
      'https://www.google.com/maps/dir/?api=1&destination=' +
        this.state.data.loc_to.address.replace(' ', '+') +
        '&travelmode=driving&dir_action=navigate',
    );
  };
  arrived = () => {
    firestore()
      .collection('Transaction')
      .doc(this.state.data.id)
      .update({
        servStatus: 4,
      })
      .then(
        () => {},
        (error) => {
          console.log(error);
        },
      )
      .catch((error) => {
        console.log(error);
      });
  };
  accept = () => {
    this.setState({loading: true});
    BackgroundGeolocation.getCurrentPosition(
      {
        timeout: 30, // 30 second timeout to fetch location
        persist: true, // Defaults to state.enabled
        maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
        desiredAccuracy: 10, // Try to fetch a location with an accuracy of `10` meters.
        samples: 1, // How many location samples to attempt.
      },
      (location) => {
        firestore()
          .collection('Transaction')
          .doc(this.state.data.id)
          .update({
            servStatus: 3,
            liveLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          })
          .then(
            () => {
              this.setState({loading: false});
            },
            (error) => {
              this.setState({loading: false});

              console.log(error);
            },
          )
          .catch((error) => {
            console.log(error);
          });
      },
    );
  };
  complete = () => {
    if (!this.state.amount) {
      this.setState({amountIsError: true});
      this.amount.current.focus();
      return;
    } else if (!this.state.payment) {
      this.setState({paymentIsError: true});
      return;
    }
    firestore()
      .collection('Transaction')
      .doc(this.state.data.id)
      .update({
        servStatus: 5,
        'driverDetails.status': 1,
        amount: this.state.amount,
        paymentMode: this.state.payment,
      })
      .then(
        () => {
          this.setState({completedModal: false});
        },
        (error) => {
          console.log(error);
        },
      )
      .catch((error) => {
        console.log(error);
      });
  };
  reject = () => {
    firestore()
      .collection('Transaction')
      .doc(this.state.data.id)
      .update({
        servStatus: 2,
        'driverDetails.status': 1,
      })
      .then(
        () => {},
        (error) => {
          console.log(error);
        },
      )
      .catch((error) => {
        console.log(error);
      });
  };
  aceeptPerm = () => {
    this.setState({disclaimer: false});
    if (!this.state.enabled) {
      BackgroundGeolocation.start(function () {
        console.log('- Start success');
      });
    }
  };
  changeValue = (field, value) => {
    this.setState({[field]: value});
    this.setState({[field + 'IsError']: false});
    this.setState({inValidText: ''});
  };
  close = () => {
    this.setState({completedModal: false});
  };
  openComplete = () => {
    this.setState({amount: null, payment: null, completedModal: true});
  };
  render() {
    const {
      data,
      inValidText,
      loading,
      driverDetails,
      completedModal,
      amountIsError,
      amount,
      paymentIsError,
      payment,
      disclaimer,
      allPerm,
    } = this.state;
    return (
      <>
        {allPerm == 0 ? (
          <View></View>
        ) : allPerm == 1 ? (
          <View style={styles.containerP}>
            <View style={styles.main}>
              <Image
                style={{width: 80, height: 80}}
                resizeMode="contain"
                source={require('../../assets/icon.jpeg')}
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
                To provide you a hassle-free connection with the booking user,
                we need the following permissions:
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
                -Location (to allow the user to see your current location even
                when the app is in background/in use/not in use/closed)
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
                -Physical activity (to allow the user to track your location
                even when the app is in background/in use/not in use/closed)
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
                Note: You won't be able to continue, until you grant the
                permissions.
              </Text>
            </View>
            <View>
              <TouchableOpacity
                style={styles.buttonP}
                onPress={this.requestCameraPermission}>
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
        ) : (
          <View style={styles.container}>
            <View style={styles.headerBar}>
              <Text></Text>
              <Text
                style={{
                  fontSize: Dimensions.get('window').width / 20,
                  fontFamily: 'lucida grande',
                  fontWeight: '700',
                  color: 'black',
                }}>
                Driver Dashboard
              </Text>
              <TouchableOpacity onPress={this.signOut}>
                <Text
                  style={{
                    fontSize: Dimensions.get('window').width / 25,
                    fontFamily: 'lucida grande',
                    fontWeight: '700',
                    color: 'black',
                  }}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator animating={true} size="large" color="red" />
              </View>
            ) : null}
            <Text
              style={{
                color: 'red',
                paddingBottom: 10,
                fontSize: Dimensions.get('window').width / 24,
                fontFamily: 'lucida grande',
                display: inValidText ? 'flex' : 'none',
                textAlign: 'center',
              }}>
              {inValidText}
            </Text>
            {driverDetails && (
              <View
                style={{
                  backgroundColor: 'white',
                  margin: 10,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    fontSize: Dimensions.get('window').width / 20,
                    fontFamily: 'lucida grande',
                    padding: 10,
                  }}>
                  {driverDetails.name}
                </Text>
                <Text
                  style={{
                    fontSize: Dimensions.get('window').width / 20,
                    fontFamily: 'lucida grande',
                    padding: 10,
                  }}>
                  Contact: {driverDetails.contact}
                </Text>
              </View>
            )}
            <ScrollView>
              {data ? (
                <View>
                  <View
                    style={{
                      backgroundColor: 'white',
                      padding: 20,
                      margin: 10,
                      flexDirection: 'row',
                      borderRadius: 7,
                    }}>
                    <View>
                      <Text style={styles.textStyle}>
                        Booking Id : {data.id}
                      </Text>

                      <Text style={styles.textStyle}>
                        Booking date:{' '}
                        {data.modifiedAt.toDate().toDateString() +
                          ' ' +
                          data.modifiedAt.toDate().toLocaleTimeString()}
                      </Text>
                      <Text style={styles.textStyle}>
                        Vehicle No.: {data.carDetails.carPlate}
                      </Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={styles.textStyle}
                          onPress={() =>
                            Linking.openURL('tel:' + data.userContact)
                          }>
                          Contact: {data.userContact}
                        </Text>
                        <Icon
                          style={{paddingHorizontal: 10}}
                          onPress={() =>
                            Linking.openURL('tel:' + data.userContact)
                          }
                          name="phone-call"
                          size={20}
                          color="green"
                        />
                      </View>
                      <Text style={styles.textStyle}>
                        Service Type: {data.servType}
                      </Text>
                      <Text style={styles.textStyle}>
                        Car make: {data.carDetails.carBrand}
                      </Text>
                      <Text style={styles.textStyle}>
                        Car Model: {data.carDetails.carModel}
                      </Text>
                      <Text style={styles.textStyle}>
                        From : {data.loc_from.address}
                      </Text>
                      <Text style={styles.textStyle}>
                        To : {data.loc_to ? data.loc_to.address : 'NA'}
                      </Text>
                    </View>
                  </View>
                  {data.servStatus == 1 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'white',
                          paddingVertical: 10,
                          paddingHorizontal: 30,
                          borderRadius: 10,
                        }}
                        onPress={this.accept}>
                        <Text style={[styles.buttonText, {color: 'green'}]}>
                          Accept
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'white',
                          paddingVertical: 10,
                          paddingHorizontal: 30,
                          borderRadius: 10,
                        }}
                        onPress={this.reject}>
                        <Text style={[styles.buttonText, {color: 'red'}]}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {data.servStatus == 3 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'white',
                          paddingVertical: 10,
                          paddingHorizontal: 30,
                          borderRadius: 10,
                        }}
                        onPress={this.navigateFrom}>
                        <Text style={[styles.buttonText, {color: 'green'}]}>
                          Navigate
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'white',
                          paddingVertical: 10,
                          paddingHorizontal: 30,
                          borderRadius: 10,
                        }}
                        onPress={this.arrived}>
                        <Text style={[styles.buttonText, {color: 'blue'}]}>
                          Arrived
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {data.servStatus == 4 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'white',
                          paddingVertical: 10,
                          paddingHorizontal: 30,
                          borderRadius: 10,
                        }}
                        onPress={this.navigateTo}>
                        <Text style={[styles.buttonText, {color: 'green'}]}>
                          Navigate
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'white',
                          paddingVertical: 10,
                          paddingHorizontal: 30,
                          borderRadius: 10,
                        }}
                        onPress={this.openComplete}>
                        <Text style={[styles.buttonText, {color: 'green'}]}>
                          Completed
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : loading == false ? (
                <View>
                  <Text
                    style={{
                      paddingVertical: 20,
                      textAlign: 'center',
                      fontSize: Dimensions.get('window').width / 20,
                      fontFamily: 'lucida grande',
                    }}>
                    No bookings yet!
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </ScrollView>
            <Modal
              animationType="slide"
              transparent={true}
              visible={completedModal}
              onRequestClose={() => this.close()}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  padding: 20,
                  ...(Platform.OS !== 'android' && {
                    zIndex: 10,
                  }),
                }}>
                <View style={{padding: 20}}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: Dimensions.get('window').width / 18,
                      paddingVertical: 10,
                    }}>
                    Amount:
                  </Text>
                  <TextInput
                    placeholderTextColor="rgba(0,0,0,0.6)"
                    placeholder="Amount"
                    style={[styles.input, amountIsError ? styles.error : null]}
                    onChangeText={(text) => this.changeValue('amount', text)}
                    value={amount}
                    ref={this.amount}
                    keyboardType="decimal-pad"
                  />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: Dimensions.get('window').width / 18,
                      paddingVertical: 10,
                    }}>
                    Payment Mode:
                  </Text>
                  <DropDownPicker
                    items={[
                      {label: 'COD', value: 'COD'},
                      {label: 'PayNow', value: 'PayNow'},
                    ]}
                    defaultValue={payment}
                    placeholder="Select payment method"
                    containerStyle={{height: 40}}
                    labelStyle={{
                      fontSize: Dimensions.get('window').width / 24,
                      fontFamily: 'sans-serif-condensed',
                    }}
                    style={{
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      borderTopWidth: paymentIsError ? 2 : 0,
                      borderBottomWidth: paymentIsError ? 2 : 0,
                      borderLeftWidth: paymentIsError ? 2 : 0,
                      borderRightWidth: paymentIsError ? 2 : 0,
                      borderColor: 'red',
                    }}
                    dropDownMaxHeight={240}
                    onChangeItem={(item) =>
                      this.changeValue('payment', item.value)
                    }
                  />

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: 'rgb(250, 204, 4)',
                      marginVertical: 20,
                    }}
                    onPress={this.complete}>
                    <Text
                      style={{
                        fontSize: Dimensions.get('window').width / 18,
                        fontFamily: 'sans-serif-condensed',
                        textAlign: 'center',
                        color: 'black',
                        padding: 10,
                      }}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e4e4',
  },
  containerP: {
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
  buttonP: {
    marginBottom: 10,
    backgroundColor: 'rgb(250, 204, 4)',
    width: Dimensions.get('window').width - 100,
  },
  input: {
    backgroundColor: '#fff',
    color: 'black',
    marginBottom: 10,
    padding: 10,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'lucida grande',
  },
  buttonText: {
    fontSize: Dimensions.get('window').width / 18,
    fontFamily: 'lucida grande',
  },
  button: {
    marginBottom: 10,
    backgroundColor: 'rgb(250, 204, 4)',
  },
  error: {
    borderColor: 'red',
    borderWidth: 2,
  },
  headerBar: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgb(250, 204, 4)',
  },
  textStyle: {
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'lucida grande',
    paddingVertical: 10,
    color: 'black',
  },
});
