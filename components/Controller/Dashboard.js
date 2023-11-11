import React, {Component, useState} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Dimensions,
  BackHandler,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import {setSubscriber} from '../HelperFunction';
import PushNotification, {Importance} from 'react-native-push-notification';

import {
  requestUserPermission,
  notificationListener,
} from '../NotificationService';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.state = {
      data: null,
      tempData: null,
      navigation: props.navigation,
      statusData: [
        {status: 'Initiated', textColor: 'red'},
        {status: 'Driver Assigned', textColor: 'orange'},
        {status: 'Driver Cancelled', textColor: 'red'},
        {status: 'Driver Accepted', textColor: 'orange'},
        {status: 'Driver Arrived', textColor: 'blue'},
        {status: 'Completed', textColor: 'green'},
      ],
    };
  }
  componentDidMount = () => {
    console.log('Agaya mai');
    const {currentUser} = auth();
    if (currentUser) {
      setSubscriber(
        firestore()
          .collection('Transaction')
          .where('servStatus', '<', 5)
          .onSnapshot(
            (querySnapshot) => {
              var aData = [];
              querySnapshot.forEach((documentSnapshot) => {
                var data = documentSnapshot.data();
                data.id = documentSnapshot.id;
                aData.push(data);
              });
              aData.sort((a, b) =>
                a.createdAt > b.createdAt
                  ? -1
                  : b.createdAt > a.createdAt
                  ? 1
                  : 0,
              );

              this.setState({data: aData, tempData: aData});
            },
            (error) => {
              console.log('Dashboard', error);
            },
          ),
      );
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
      requestUserPermission('Controller');

      notificationListener();
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  };
  searchFilterFunction = (text) => {
    var newData;
    if (text && this.state.data) {
      newData = this.state.data.filter((item) => {
        const itemData = `${item.carDetails.carPlate.toUpperCase()}`;
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
    } else {
      newData = this.state.tempData;
    }
    this.setState({data: newData});
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
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  render() {
    const {data, navigation, statusData} = this.state;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="rgb(250, 204, 4)" />
        <Text
          style={{
            fontSize: Dimensions.get('window').width / 18,
            fontFamily: 'sans-serif-condensed',
            padding: 20,
          }}>
          Ongoing transactions
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: 10,
            borderRadius: 10,
            margin: 10,
          }}>
          <TextInput
            onChangeText={this.searchFilterFunction}
            style={styles.search}
            placeholder="Search Vehicle No"
          />
          <Icon name="search1" size={30} color="grey" />
        </View>
        {data ? (
          data.length > 0 ? (
            <FlatList
              keyExtractor={(item, index) => item.id}
              data={data}
              renderItem={(itemData) => (
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    padding: 20,
                    margin: 10,
                    flexDirection: 'row',
                    flex: 1,
                    borderRadius: 7,
                  }}
                  onPress={() =>
                    navigation.navigate('BookingDetail', {
                      back: 'Dashboard',
                      bookId: itemData.item.id,
                    })
                  }>
                  <View>
                    <Text
                      style={{
                        fontSize: Dimensions.get('window').width / 18,
                        fontFamily: 'sans-serif-condensed',
                        paddingVertical: 10,
                        color: statusData[itemData.item.servStatus].textColor,
                      }}>
                      {statusData[itemData.item.servStatus].status}
                    </Text>
                    <Text style={styles.textStyle}>
                      {itemData.item.createdAt.toDate().toDateString() +
                        ' ' +
                        itemData.item.createdAt.toDate().toLocaleTimeString()}
                    </Text>
                    <Text style={styles.textStyle}>
                      Service Type : {itemData.item.servType}
                    </Text>
                    {itemData.item.userContact && (
                      <Text style={styles.textStyle}>
                        Mobile no. : {itemData.item.userContact}
                      </Text>
                    )}
                    <Text style={styles.textStyle}>
                      Vehicle No. : {itemData.item.carDetails.carPlate}
                    </Text>
                    {itemData.item.driverDetails && (
                      <Text style={styles.textStyle}>
                        Tow car no. : {itemData.item.driverDetails.vehicleNo}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View>
              <Text
                style={{
                  paddingVertical: 20,
                  textAlign: 'center',
                  fontSize: Dimensions.get('window').width / 20,
                  fontFamily: 'lucida grande',
                }}>
                No ongoing transaction
              </Text>
            </View>
          )
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator animating={true} size="large" color="red" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e4e4',
  },
  search: {
    backgroundColor: 'white',
    color: 'black',
    padding: 10,
    flex: 3,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'lucida grande',
  },
  input: {
    backgroundColor: '#e6e4e2',
    color: 'black',
    marginBottom: 10,
    padding: 10,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
  },
  textStyle: {
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    paddingVertical: 10,
  },
  button: {
    marginBottom: 10,
    backgroundColor: 'rgb(250, 204, 4)',
  },
  error: {
    borderColor: 'red',
    borderWidth: 2,
  },
});
