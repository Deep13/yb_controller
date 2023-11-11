import React, {Component} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  Dimensions,
  BackHandler,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import firestore from '@react-native-firebase/firestore';
import {setSubscriber} from '../HelperFunction';
import Geolocation from '@react-native-community/geolocation';
import MapView, {
  Marker,
  Polyline,
  Callout,
  PROVIDER_GOOGLE,
  OverlayComponent,
  AnimatedRegion,
  Animated,
} from 'react-native-maps';
let animationTimeout;
export default class TrackDriver extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.map = null;
    this.handleBackButton = this.handleBackButton.bind(this);
    this.state = {
      navigation: props.navigation,
      toa: null,
      data: '',
      statusText: [
        'Driver will be assigned shortly',
        'Waiting for driver confirmation',
        'Driver will be assigned shortly',
      ],
      region: {
        latitude: 1.352083,
        longitude: 103.819836,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      markers: [],
      animated: false,
      driver: null,
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const transactionId = route.params.transactionId;
    setSubscriber(
      firestore()
        .collection('Transaction')
        .doc(transactionId)
        .onSnapshot(
          (documentSnapshot) => {
            // console.log('User exists: ', documentSnapshot.exists);

            if (documentSnapshot.exists) {
              // console.log(documentSnapshot.data());
              let data = documentSnapshot.data();
              data.id = documentSnapshot.id;
              if (data.servStatus !== 5) {
                this.setState({
                  data: data,
                  markers: data.loc_to
                    ? [
                        {
                          latlng: {
                            latitude: data.loc_from.lat,
                            longitude: data.loc_from.long,
                          },
                          title: 'Start',
                          identifier: 'Start',
                          color: 'red',
                        },
                        {
                          latlng: {
                            latitude: data.loc_to.lat,
                            longitude: data.loc_to.long,
                          },
                          title: 'End',
                          identifier: 'End',
                          color: 'green',
                        },
                      ]
                    : [
                        {
                          latlng: {
                            latitude: data.loc_from.lat,
                            longitude: data.loc_from.long,
                          },
                          title: 'Start',
                          identifier: 'Start',
                          color: 'red',
                        },
                      ],
                });

                if (data.servStatus > 2) {
                  if (data.liveLocation) {
                    this.setState({
                      driver: {
                        coordinate: {
                          latitude: data.liveLocation
                            ? data.liveLocation.latitude
                            : null,
                          longitude: data.liveLocation
                            ? data.liveLocation.longitude
                            : null,
                        },
                        heading: data.liveLocation.heading,
                      },
                    });
                    if (data.servStatus == 3) {
                      var from =
                        data.liveLocation.latitude +
                        ',' +
                        data.liveLocation.longitude;
                      var to = data.loc_from.lat + ',' + data.loc_from.long;
                      this.fetchOnlineTextData(from, to);
                    } else if (data.servStatus == 4 && data.loc_to) {
                      var from =
                        data.liveLocation.latitude +
                        ',' +
                        data.liveLocation.longitude;
                      var to = data.loc_to.lat + ',' + data.loc_to.long;
                      this.fetchOnlineTextData(from, to);
                    }
                  }
                  // if (!this.state.animated) {
                  //   this.animate();
                  //   this.setState({animated: true});
                  // }
                }
              } else {
                this.state.navigation.navigate('Dashboard');
              }
            } else {
              console.log('Does not exist');
            }
          },
          (error) => {
            console.log(error);
          },
        ),
    );
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  fetchOnlineTextData = (from, to) => {
    var url =
      'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' +
      from +
      '&destinations=' +
      to +
      '&key=AIzaSyBr0GhOdiiOeaUaVHvMibAD_m3RKZLYueM';
    fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.rows[0].elements[0].duration.text);
        if (responseJson.rows[0]) {
          this.setState({toa: responseJson.rows[0].elements[0].duration.text});
        }
      })
      .catch((error) => {
        console.log('offline text data');
      });
  };

  goToCurrentLocation = () => {
    var aMarkers = [];
    if (this.state.markers.length > 0) {
      this.state.markers.forEach(function (val) {
        aMarkers.push(val.latlng);
      });
      if (this.state.driver) {
        aMarkers.push(this.state.driver.coordinate);
      }
      this.animate(aMarkers);
    }
  };
  goToCurrentLocationComplete = () => {
    var aMarkers = [];
    if (this.state.markers.length > 0) {
      this.state.markers.forEach(function (val) {
        aMarkers.push(val.latlng);
      });
      if (aMarkers.length == 1) {
        var region = {...aMarkers[0]};
        region.latitudeDelta = 0.0922;
        region.longitudeDelta = 0.0421;
        this.mapImage.animateToRegion(region);
      } else if (aMarkers.length == 2) {
        this.mapImage.fitToCoordinates(aMarkers, {
          edgePadding: {top: 400, bottom: 400, right: 200, left: 200},
          animated: true,
        });
      }
    }
  };
  handleBackButton = () => {
    this.state.navigation.navigate('Dashboard');
    return true;
  };
  componentDidUpdate() {
    // if (this.state.data.servStatus > 1) {
    //   if (!this.state.animated) {
    //     this.animate();
    //     this.setState({animated: true});
    //   }
    // }
  }
  animate = (aMarkers) => {
    // var aMarkers = [];

    // // console.log('map', this.state.markers);
    // if (this.state.markers.length > 0) {
    //   this.state.markers.forEach(function(val) {
    //     aMarkers.push(val.latlng);
    //   });
    //   if (this.state.driver) {
    //     aMarkers.push(this.state.driver);
    //   }
    //   // if (!this.state.animated) {
    //   console.log(this.state.driver);

    //   // animationTimeout = setTimeout(() => {
    //   // this.map.fitToSuppliedMarkers(['Start', 'End'], true);

    this.map.fitToCoordinates(aMarkers, {
      edgePadding: {top: 100, bottom: 100, right: 100, left: 100},
      animated: true,
    });
    // }, 2000);
    // }
    // this.setState({animated: true});
    // }
  };
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  onMoveMap = (place) => {
    this.setState({
      region: {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    });
  };
  render() {
    const {
      data,
      navigation,
      statusText,
      region,
      markers,
      driver,
      statusString,
      toa,
    } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="rgb(250, 204, 4)" />
        {data.servStatus > 2 && data.servStatus < 5 && (
          <View style={{flex: 1}}>
            <View style={{flex: 1}}>
              <MapView
                ref={(ref) => {
                  this.map = ref;
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                flat
                onMapReady={this.goToCurrentLocation}
                followsUserLocation={true}
                style={styles.map}
                onRegionChangeComplete={this.onMoveMap}
                initialRegion={region}>
                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    identifier={marker.identifier}
                    coordinate={marker.latlng}
                    title={marker.title}
                    pinColor={marker.color}
                  />
                ))}
                {driver && (
                  <Marker.Animated
                    identifier="Driver"
                    coordinate={driver.coordinate}
                    anchor={{x: 0.5, y: 0.5}}
                    style={{
                      transform: [
                        {
                          rotate: `${driver.heading}deg`,
                        },
                      ],
                    }}
                    title="Driver">
                    <Image
                      source={require('../../assets/driver_icon.png')}
                      style={{
                        width: Dimensions.get('window').width / 10,
                        transform: [
                          {
                            rotate: '0deg',
                          },
                        ],
                      }}
                    />
                  </Marker.Animated>
                )}
              </MapView>
            </View>
            <View
              style={{
                padding: 30,
              }}>
              <Text
                style={{
                  fontSize: Dimensions.get('window').width / 25,
                  fontFamily: 'sans-serif-condensed',
                  paddingVertical: 10,
                }}>
                Driver name: {data.driverDetails.name}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    fontSize: Dimensions.get('window').width / 25,
                    fontFamily: 'sans-serif-condensed',
                  }}
                  onPress={() =>
                    Linking.openURL('tel:' + data.driverDetails.contact)
                  }>
                  Contact: {data.driverDetails.contact}
                </Text>
                <Icon
                  style={{paddingHorizontal: 10}}
                  onPress={() =>
                    Linking.openURL('tel:' + data.driverDetails.contact)
                  }
                  name="phone"
                  size={20}
                  color="green"
                />
              </View>
              {toa && (
                <Text
                  style={{
                    fontSize: Dimensions.get('window').width / 25,
                    fontFamily: 'sans-serif-condensed',
                    paddingVertical: 10,
                  }}>
                  Estimated time of arrival: {toa}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={this.goToCurrentLocation}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: '#fff',
                padding: 10,
              }}>
              <Entypo name="location" size={30} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
});
