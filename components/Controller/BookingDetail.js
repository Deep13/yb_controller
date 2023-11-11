import React, {Component, useState} from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Modal,
  BackHandler,
  FlatList,
  Dimensions,
  Linking,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import {setSubscriber} from '../HelperFunction';
import DropDownPicker from 'react-native-dropdown-picker';
import Dialog, {
  ScaleAnimation,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogButton,
} from 'react-native-popup-dialog';
export default class BookingDetail extends Component {
  constructor(props) {
    super(props);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.state = {
      navigation: props.navigation,
      data: null,
      inValidText: '',
      aDriverItems: [],
      sDriver: null,
      loading: false,
      refreshing: false,
      driverSuccess: false,
      driverConfirm: false,
      modalVisible: false,
      statusData: [
        {status: 'Initiated', textColor: 'red'},
        {status: 'Driver Assigned', textColor: 'orange'},
        {status: 'Driver Cancelled', textColor: 'red'},
        {status: 'Driver Accepted', textColor: 'orange'},
        {status: 'Driver Arrived', textColor: 'blue'},
        {status: 'Completed', textColor: 'green'},
        {status: 'Cancelled', textColor: 'red'},
      ],
    };
  }

  componentDidMount = () => {
    const {bookId} = this.props.route.params;
    console.log(bookId);
    firestore()
      .collection('Controller')
      .where('role', '==', 'auth_dr')
      .get()
      .then(
        (querySnapshot) => {
          var aData = [];
          querySnapshot.forEach((documentSnapshot) => {
            var data = documentSnapshot.data();
            data.id = documentSnapshot.id;
            aData.push(data);
          });
          this.setState({aDriverItems: aData});
        },
        (error) => {
          console.log(error);
        },
      );
    setSubscriber(
      firestore()
        .collection('Transaction')
        .doc(bookId)
        .onSnapshot(
          (documentSnapshot) => {
            if (documentSnapshot.exists) {
              var data = documentSnapshot.data();
              data.id = documentSnapshot.id;
              // console.log(data);
              this.setState({data: data});
            } else {
            }
          },
          (error) => {
            console.log(error);
          },
        ),
    );
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  };
  handleBackButton = () => {
    const {back} = this.props.route.params;
    this.state.navigation.navigate(back);
    return true;
  };
  cancel = () => {
    Alert.alert('Confirm', 'Do you want to cancel the transaction?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          const {bookId} = this.props.route.params;
          this.setState({loading: true});
          firestore()
            .collection('Transaction')
            .doc(bookId)
            .update({
              driverDetails: firestore.FieldValue.delete(),
              servStatus: 6,
              modifiedAt: firestore.Timestamp.now(),
            })
            .then(
              (response) => {
                this.setState({
                  loading: false,
                });
                // console.log('success', response);
              },
              (error) => {
                this.setState({loading: false});
                console.log(error);
              },
            );
        },
      },
    ]);
  };
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  changeValue = (field, value) => {
    this.setState({[field]: value});
    this.setState({[field + 'IsError']: false});
    this.setState({inValidText: ''});
    if (field === 'carBrand') {
      this.setState({carModel: null});
    }
  };
  hideModal = () => {
    this.setState({modalVisible: false});
  };
  onRefresh = () => {
    const {bookId} = this.props.route.params;
    firestore()
      .collection('Transaction')
      .doc(bookId)
      .get()
      .then(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            var data = documentSnapshot.data();
            data.id = documentSnapshot.id;
            this.setState({data: data, refreshing: false});
          } else {
          }
        },
        (error) => {
          console.log(error);
          this.setState({refreshing: false});
        },
      );
  };
  onChooseDriver = () => {
    if (this.state.data.driverDetails) {
      this.setState({driverConfirm: true});
    } else {
      this.setState({modalVisible: true});
    }
  };
  onSelectDriver = (value) => {
    this.setState({
      data: {
        ...this.state.data,
        driverDetails: {
          name: value.name,
          contact: value.contact,
          userId: value.UserID,
          vehicleNo: value.vehicleNo,
          status: 0,
        },
      },
    });
    this.hideModal();
  };
  update = () => {
    const {bookId} = this.props.route.params;
    this.setState({loading: true});
    firestore()
      .collection('Transaction')
      .doc(bookId)
      .update({
        driverDetails: this.state.data.driverDetails,
        servStatus: 1,
        modifiedAt: firestore.Timestamp.now(),
      })
      .then(
        (response) => {
          this.setState({
            loading: false,
            driverSuccess: true,
            data: {
              ...this.state.data,
              servStatus: 1,
            },
          });
          // console.log('success', response);
        },
        (error) => {
          this.setState({loading: false});
          console.log(error);
        },
      );
  };

  render() {
    const {
      data,
      driverSuccess,
      navigation,
      inValidText,
      loading,
      statusData,
      modalVisible,
      aDriverItems,
      sDriver,
      refreshing,
      driverConfirm,
    } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="rgb(250, 204, 4)" />
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator animating={true} size="large" color="red" />
          </View>
        ) : null}
        <Dialog
          visible={driverSuccess}
          dialogAnimation={
            new ScaleAnimation({
              initialValue: 0, // optional
              useNativeDriver: true, // optional
            })
          }
          onHardwareBackPress={() => {
            this.setState({driverSuccess: false});
            return true;
          }}
          dialogTitle={<DialogTitle title="Successful" />}
          footer={
            <DialogFooter>
              <DialogButton
                text="OK"
                onPress={() => {
                  this.setState({driverSuccess: false});
                }}
              />
            </DialogFooter>
          }>
          <DialogContent>
            <Text
              style={{
                fontSize: Dimensions.get('window').width / 28,
                fontFamily: 'sans-serif-condensed',
                padding: 10,
                alignItems: 'center',
              }}>
              Driver has been assigned successfully
            </Text>
          </DialogContent>
        </Dialog>
        <Dialog
          visible={driverConfirm}
          dialogAnimation={
            new ScaleAnimation({
              initialValue: 0, // optional
              useNativeDriver: true, // optional
            })
          }
          onHardwareBackPress={() => {
            this.setState({driverConfirm: false});
            return true;
          }}
          dialogTitle={<DialogTitle title="Driver already assigned" />}
          footer={
            <DialogFooter>
              <DialogButton
                text="OK"
                onPress={() =>
                  this.setState({modalVisible: true, driverConfirm: false})
                }
              />
              <DialogButton
                text="Cancel"
                onPress={() => {
                  this.setState({driverConfirm: false});
                }}
              />
            </DialogFooter>
          }>
          <DialogContent>
            <Text
              style={{
                fontSize: Dimensions.get('window').width / 28,
                fontFamily: 'sans-serif-condensed',
                padding: 10,
                alignItems: 'center',
              }}>
              Driver is already assigned. Do you want to override?
            </Text>
          </DialogContent>
        </Dialog>
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={this.hideModal}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.9)',
              padding: 20,
            }}>
            <View>
              <Text
                style={{
                  fontSize: Dimensions.get('window').width / 15,
                  fontFamily: 'sans-serif-condensed',
                  textAlign: 'center',
                  color: 'white',
                  marginVertical: 10,
                }}>
                Select a driver
              </Text>
              <FlatList
                keyExtractor={(item, index) => item.id}
                data={aDriverItems}
                renderItem={(itemData) => (
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'white',
                      padding: 20,
                      margin: 5,
                      borderRadius: 7,
                    }}
                    onPress={() => this.onSelectDriver(itemData.item)}>
                    <Text
                      style={{
                        fontSize: Dimensions.get('window').width / 20,
                        fontFamily: 'sans-serif-condensed',
                        color: 'black',
                      }}>
                      {itemData.item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
        {data ? (
          <View
            style={{
              paddingTop: 20,
              flex: 1,
              width: '100%',
              backgroundColor: 'white',
            }}>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={this.onRefresh}
                />
              }>
              <Text
                style={{
                  fontSize: Dimensions.get('window').width / 18,
                  fontFamily: 'sans-serif-condensed',
                  paddingVertical: 10,
                  textAlign: 'center',
                  color: statusData[data.servStatus].textColor,
                }}>
                {statusData[data.servStatus].status}
              </Text>
              {data.servStatus != 6 && (
                <View>
                  <View style={styles.formElement}>
                    <Text style={styles.formLabel}>Driver Name:</Text>
                    <View
                      style={{
                        flex: 3,
                        alignItems: 'center',
                        flexDirection: 'row',
                      }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: 'white',
                          borderWidth: 1,
                          padding: 10,
                        }}
                        onPress={this.onChooseDriver}>
                        <Text
                          style={{
                            fontSize: Dimensions.get('window').width / 20,
                            fontFamily: 'sans-serif-condensed',
                            color: 'black',
                            textAlign: 'center',
                          }}>
                          {data.driverDetails
                            ? data.driverDetails.name
                            : 'Assign a driver'}
                        </Text>
                      </TouchableOpacity>
                      {data.servStatus > 2 && data.servStatus < 5 && (
                        <Icon
                          style={{paddingHorizontal: 10}}
                          onPress={() =>
                            navigation.navigate('TrackDriver', {
                              transactionId: data.id,
                            })
                          }
                          name="share"
                          size={20}
                          color="black"
                        />
                      )}
                    </View>
                  </View>
                  {data.driverDetails && (
                    <View>
                      <View style={styles.formElement}>
                        <Text style={styles.formLabel}>Driver Contact:</Text>
                        <View
                          style={{
                            flex: 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              backgroundColor: '#e6e4e2',
                              color: 'black',
                              padding: 10,
                              fontSize: Dimensions.get('window').width / 24,
                              fontFamily: 'sans-serif-condensed',
                              flex: 1,
                              alignItems: 'center',
                            }}
                            onPress={() =>
                              Linking.openURL(
                                'tel:' + data.driverDetails.contact,
                              )
                            }>
                            {data.driverDetails.contact}
                          </Text>
                          <Icon
                            style={{paddingHorizontal: 10}}
                            onPress={() =>
                              Linking.openURL(
                                'tel:' + data.driverDetails.contact,
                              )
                            }
                            name="phone"
                            size={20}
                            color="green"
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          paddingVertical: 20,
                          width: '100%',
                          flexDirection: 'row',
                        }}>
                        <Text style={{flex: 1}}></Text>
                        <TouchableOpacity
                          style={styles.button}
                          activeOpacity={0.6}
                          onPress={this.update}>
                          <Text
                            style={{
                              color: 'black',
                              textAlign: 'center',
                              fontSize: Dimensions.get('window').width / 20,
                              fontFamily: 'sans-serif-condensed',
                              fontWeight: '700',
                              paddingVertical: 10,
                            }}>
                            Submit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>User id:</Text>
                <Text style={styles.input}>{data.userID}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Email:</Text>
                <Text style={styles.input}>{data.email}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Name:</Text>
                <Text style={styles.input}>
                  {data.userName ? data.userName : 'NA'}
                </Text>
              </View>
              {data.userContact && (
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>Mobile no.</Text>
                  <View
                    style={{
                      flex: 3,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        backgroundColor: '#e6e4e2',
                        color: 'black',
                        padding: 10,
                        fontSize: Dimensions.get('window').width / 24,
                        fontFamily: 'sans-serif-condensed',
                        flex: 1,
                        alignItems: 'flex-start',
                      }}
                      onPress={() =>
                        Linking.openURL('tel:' + data.userContact)
                      }>
                      {data.userContact}
                    </Text>
                    <Icon
                      style={{paddingHorizontal: 10}}
                      onPress={() => Linking.openURL('tel:' + data.userContact)}
                      name="phone"
                      size={20}
                      color="green"
                    />
                  </View>
                </View>
              )}
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>User Role:</Text>
                <Text style={styles.input}>
                  {data.userRole
                    ? data.userRole == 'BASIC'
                      ? 'Non-member'
                      : data.userRole
                    : ''}
                </Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Service type:</Text>
                <Text style={styles.input}>{data.servType}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Parking type:</Text>
                <Text style={styles.input}>{data.parkingType}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Vehicle Number:</Text>
                <Text style={styles.input}>{data.carDetails.carPlate}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Car Make:</Text>
                <Text style={styles.input}>{data.carDetails.carBrand}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Car Model:</Text>
                <Text style={styles.input}>{data.carDetails.carModel}</Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Discount Applied:</Text>
                <Text style={styles.input}>
                  {data.discountApp ? data.discountApp.description : 'NA'}
                </Text>
              </View>
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>Organisations code:</Text>
                <Text style={styles.input}>
                  {data.additional ? data.additional : 'NA'}
                </Text>
              </View>
              {data.amount && (
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>Amount Paid:</Text>
                  <Text style={styles.input}>
                    {data.amount ? data.amount : 'NA'}
                  </Text>
                </View>
              )}
              {data.paymentMode && (
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>Payment Mode:</Text>
                  <Text style={styles.input}>
                    {data.paymentMode ? data.paymentMode : 'NA'}
                  </Text>
                </View>
              )}
              <View style={styles.formElement}>
                <Text style={styles.formLabel}>From:</Text>
                <Text style={styles.input}>{data.loc_from.address}</Text>
              </View>
              {data.loc_to && (
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>To:</Text>
                  <Text style={styles.input}>{data.loc_to.address}</Text>
                </View>
              )}
              {data.servStatus != 5 && data.servStatus != 6 && (
                <View
                  style={{
                    flex: 1,
                    paddingVertical: 20,
                    width: '100%',
                    flexDirection: 'row',
                  }}>
                  <Text style={{flex: 1}}></Text>
                  <TouchableOpacity
                    style={[styles.button, {backgroundColor: 'red'}]}
                    activeOpacity={0.6}
                    onPress={this.cancel}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: Dimensions.get('window').width / 20,
                        fontFamily: 'sans-serif-condensed',
                        fontWeight: '700',
                        paddingVertical: 10,
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
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
    backgroundColor: '#fff',
  },
  input: {
    backgroundColor: '#e6e4e2',
    color: 'black',
    padding: 10,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    flex: 3,
    alignItems: 'center',
  },
  textStyle: {
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    paddingVertical: 10,
  },
  formElement: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  formLabel: {
    color: 'black',
    textAlign: 'right',
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    paddingRight: 20,
    flex: 1,
  },
  error: {
    borderColor: 'red',
    borderWidth: 2,
  },
  button: {
    flex: 3,
    marginHorizontal: 30,
    backgroundColor: 'rgb(250, 204, 4)',
  },
});
