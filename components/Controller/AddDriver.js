import React, {Component, useState} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions,
  Linking,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
export default class AddVehicle extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.handleBackButton = this.handleBackButton.bind(this);
    this.Mobile = React.createRef();
    this.Email = React.createRef();
    this.Password = React.createRef();
    this.confirmPassword = React.createRef();
    this.dName = React.createRef();
    this.vehicle = React.createRef();
    this.state = {
      inValidText: '',
      loading: false,
      Email: null,
      Password: null,
      EmailIsError: false,
      PasswordIsError: false,
      confirmPasswordIsError: false,
      confirmPassword: null,
      dName: null,
      dNameIsError: false,
      MobileCode: '+65',
      MobileCodeIsError: false,
      Mobile: null,
      MobileIsError: false,
      vehicle: null,
      vehicleIsError: false,
      navigation: props.navigation,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }
  handleBackButton = () => {
    this.state.navigation.navigate('UpdateDriver');
    return true;
  };
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  checkOnSubmit = () => {
    this.setState({inValidText: ''});
    const fieldArray = [
      'Email',
      'Password',
      'confirmPassword',
      'dName',
      'vehicle',
      'MobileCode',
      'Mobile',
    ];
    var text = '';
    for (var i = 0; i < fieldArray.length; i++) {
      if (!this.state[fieldArray[i]]) {
        this.setState({[fieldArray[i] + 'IsError']: true});
        text = 'All fields are mandatory';
        this.setState({inValidText: text});
        if (fieldArray[i] != 'MobileCode') {
          this[fieldArray[i]].current.focus();
        }
        return;
      } else if (fieldArray[i] === 'Email') {
        const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(this.state.Email) === false) {
          this.setState({EmailIsError: true});
          text = 'Email is invalid';
          this.setState({inValidText: text});
          return;
        }
      } else if (fieldArray[i] === 'Password') {
        if (this.state.Password.length < 6) {
          this.setState({PasswordIsError: true});
          text = 'Password should be atleast 6 characters';
          this.setState({inValidText: text});
          return;
        }
      } else if (fieldArray[i] === 'confirmPassword') {
        if (this.state.confirmPassword !== this.state.Password) {
          this.setState({confirmPasswordIsError: true});
          text = 'Passwords did not match';
          this.setState({inValidText: text});
          return;
        }
      } else if (fieldArray[i] === 'Mobile') {
        var reg = /^\(?([0-9]{9,10})$/;
        if (this.state.MobileCode == '+65') {
          reg = /^\(?([0-9]{8,10})$/;
        }
        if (reg.test(this.state.Mobile) === false) {
          this.setState({MobileIsError: true});
          text = 'Mobile Number is invalid';
          this.setState({inValidText: text});
          return;
        }
      }
    }

    console.log('No Error');
    this.setState({loading: true});
    const {Email, Password, dName, MobileCode, Mobile, vehicle} = this.state;
    auth()
      .createUserWithEmailAndPassword(this.state.Email, this.state.Password)
      .then((data) => {
        console.log('User account created & signed in!');
        console.log(data.user.uid);
        firestore()
          .collection('Controller')
          .doc(data.user.uid)
          .set({
            name: dName,
            email: Email,
            password: Password,
            UserID: data.user.uid,
            contact: MobileCode + Mobile,
            vehicleNo: vehicle,
            role: 'auth_dr',
          })
          .then(
            (response) => {
              this.setState({loading: false});
              console.log('success', response);
            },
            (error) => {
              this.setState({loading: false});
              console.log(error);
            },
          );
      })
      .catch((error) => {
        this.setState({loading: false});
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
          this.setState({
            inValidText: 'That email address is already in use!',
          });
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          this.setState({inValidText: 'That email address is invalid!'});
        }
        this.setState({loading: false});
        // console.error(error);
      });
  };
  changeValue = (field, value) => {
    this.setState({[field]: value});
    this.setState({[field + 'IsError']: false});
    this.setState({inValidText: ''});
  };
  render() {
    const {
      dNameIsError,
      dName,
      MobileCode,
      MobileCodeIsError,
      Mobile,
      MobileIsError,
      inValidText,
      loading,
      status,
      vehicle,
      vehicleIsError,
      Email,
      Password,
      confirmPassword,
      EmailIsError,
      PasswordIsError,
      confirmPasswordIsError,
    } = this.state;
    return (
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator animating={true} size="large" color="red" />
          </View>
        ) : null}
        <Text
          style={{
            color: 'black',
            textAlign: 'center',
            fontSize: Dimensions.get('window').width / 24,
            fontFamily: 'sans-serif-condensed',
            paddingTop: 20,
          }}>
          Please fill the details!!
        </Text>
        <Text
          style={{
            color: 'red',
            paddingBottom: 10,
            fontSize: Dimensions.get('window').width / 24,
            fontFamily: 'sans-serif-condensed',
            display: inValidText ? 'flex' : 'none',
          }}>
          {inValidText}
        </Text>
        <View style={{paddingTop: 20, flex: 1, width: '100%'}}>
          <ScrollView contentContainerStyle={{minHeight: '100%'}}>
            <View style={styles.formElement}>
              <Text style={styles.formLabel}>Email:</Text>
              <TextInput
                placeholderTextColor="black"
                placeholder="Enter email address"
                style={[styles.input, EmailIsError ? styles.error : null]}
                onChangeText={(text) => this.changeValue('Email', text)}
                value={Email}
                ref={this.Email}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.formElement}>
              <Text style={styles.formLabel}>Password:</Text>
              <TextInput
                placeholderTextColor="black"
                secureTextEntry={true}
                placeholder="At least 6 characters"
                style={[styles.input, PasswordIsError ? styles.error : null]}
                onChangeText={(text) => this.changeValue('Password', text)}
                value={Password}
                ref={this.Password}
              />
            </View>
            <View style={styles.formElement}>
              <Text style={styles.formLabel}>Confirm Password:</Text>
              <TextInput
                placeholderTextColor="black"
                secureTextEntry={true}
                placeholder="Re-type password"
                style={[
                  styles.input,
                  confirmPasswordIsError ? styles.error : null,
                ]}
                onChangeText={(text) =>
                  this.changeValue('confirmPassword', text)
                }
                value={confirmPassword}
                ref={this.confirmPassword}
              />
            </View>
            <View style={styles.formElement}>
              <Text style={styles.formLabel}>Driver name</Text>
              <TextInput
                placeholderTextColor="black"
                placeholder="Enter driver name"
                style={[styles.input, dNameIsError ? styles.error : null]}
                onChangeText={(text) => this.changeValue('dName', text)}
                value={dName}
                ref={this.dName}
              />
            </View>
            <View style={styles.formElement}>
              <Text style={styles.formLabel}>Vehicle No</Text>
              <TextInput
                placeholderTextColor="black"
                placeholder="Vehicle no"
                style={[styles.input, vehicleIsError ? styles.error : null]}
                onChangeText={(text) => this.changeValue('vehicle', text)}
                value={vehicle}
                ref={this.vehicle}
              />
            </View>
            <View style={styles.formElement}>
              <Text style={styles.formLabel}>Mobile No:</Text>
              <View style={{flex: 3, flexDirection: 'row'}}>
                <View
                  style={{
                    flex: 1,
                  }}>
                  <DropDownPicker
                    items={[
                      {label: '+65', value: '+65'},
                      {label: '+60', value: '+60'},
                    ]}
                    defaultValue={MobileCode}
                    placeholder="Code"
                    containerStyle={{
                      height: Dimensions.get('window').width / 24 + 30,
                    }}
                    labelStyle={{
                      fontSize: Dimensions.get('window').width / 28,
                      fontFamily: 'sans-serif-condensed',
                    }}
                    style={{
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      borderTopWidth: MobileCodeIsError ? 2 : 0,
                      borderBottomWidth: MobileCodeIsError ? 2 : 0,
                      borderLeftWidth: MobileCodeIsError ? 2 : 0,
                      borderRightWidth: MobileCodeIsError ? 2 : 0,
                      borderColor: 'red',
                      backgroundColor: 'rgb(250, 204, 4)',
                    }}
                    dropDownMaxHeight={240}
                    onChangeItem={(item) =>
                      this.changeValue('MobileCode', item.value)
                    }
                  />
                </View>
                <TextInput
                  placeholderTextColor="black"
                  placeholder="Contact no"
                  style={[styles.mobile, MobileIsError ? styles.error : null]}
                  onChangeText={(text) => this.changeValue('Mobile', text)}
                  value={Mobile}
                  keyboardType="numeric"
                  ref={this.Mobile}
                  maxLength={MobileCode == '+65' ? 8 : 10}
                />
              </View>
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            justifyContent: 'flex-end',
            paddingBottom: 20,
            width: '100%',
            display: status == 1 ? 'none' : 'flex',
          }}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.6}
            onPress={this.checkOnSubmit.bind(this)}>
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e4e4',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    backgroundColor: 'rgb(250, 204, 4)',
    color: 'black',
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    flex: 3,
  },
  button: {
    marginHorizontal: 30,
    backgroundColor: 'rgb(250, 204, 4)',
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
  mobile: {
    backgroundColor: 'rgb(250, 204, 4)',
    color: 'black',
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    flex: 2,
  },
});
