import React, {Component, useState} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  FlatList,
  BackHandler,
  Dimensions,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {setSubscriber} from '../HelperFunction';
import Icon from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
export default class AllBookings extends Component {
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
        {status: 'Controller Cancelled', textColor: 'red'},
      ],
    };
  }

  componentDidMount = () => {
    setSubscriber(
      firestore()
        .collection('Transaction')
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          (querySnapshot) => {
            var aData = [];
            querySnapshot.forEach((documentSnapshot) => {
              var data = documentSnapshot.data();
              data.id = documentSnapshot.id;
              aData.push(data);
            });
            this.setState({data: aData, tempData: aData});
          },
          (error) => {
            console.log(error);
          },
        ),
    );
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
    this.state.navigation.navigate('Dashboard');
    return true;
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
          All Transactions
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
                    back: 'AllBookings',
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
  input: {
    backgroundColor: '#e6e4e2',
    color: 'black',
    marginBottom: 10,
    padding: 10,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
  },
  search: {
    backgroundColor: 'white',
    color: 'black',
    padding: 10,
    flex: 3,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'lucida grande',
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
