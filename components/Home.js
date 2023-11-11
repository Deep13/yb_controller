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
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
const textTitle = [
  {id: '001', text: 'Title1', desc: 'Description1'},
  {id: '002', text: 'Title2', desc: 'Description2'},
  {id: '003', text: 'Title3', desc: 'Description3'},
];

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.email = React.createRef();
    this.password = React.createRef();
    this.state = {
      navigation: props.navigation,
      email: '',
      password: '',
      emailIsError: false,
      passwordIsError: false,
      inValidText: '',
      loading: false,
    };
  }
  componentDidMount = () => {
    const {currentUser} = auth();
    if (currentUser) {
      firestore()
        .collection('Controller')
        .doc(currentUser.uid)
        .get()
        .then((documentSnapshot) => {
          if (documentSnapshot.exists) {
            if (documentSnapshot.data().role === 'auth_cont') {
              this.state.navigation.navigate('DashboardStack');
            } else if (documentSnapshot.data().role === 'auth_dr') {
              this.state.navigation.navigate('DriverStack');
            }
          }
        });
    }
  };

  login = () => {
    this.setState({inValidText: ''});
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!this.state.email) {
      this.setState({emailIsError: true});
      this.setState({inValidText: 'Email is empty'});
      this.email.current.focus();
      return;
    } else if (!reg.test(this.state.email)) {
      this.setState({emailIsError: true});
      this.email.current.focus();
      this.setState({inValidText: 'Invaild login credentials'});
      return;
    } else if (!this.state.password) {
      this.setState({passwordIsError: true});
      this.password.current.focus();
      this.setState({inValidText: 'Password is empty'});
      return;
    }
    this.setState({disclaimer: false, loading: true});
    auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((data) => {
        console.log('User signed in!', data);
        firestore()
          .collection('Controller')
          .doc(data.user.uid)
          .get()
          .then((documentSnapshot) => {
            if (documentSnapshot.exists) {
              this.setState({loading: false, email: null, password: null});
              console.log('User data: ', documentSnapshot.data());
              if (documentSnapshot.data().role === 'auth_cont') {
                this.state.navigation.navigate('DashboardStack');
              } else {
                this.state.navigation.navigate('DriverStack');
              }
            } else {
              this.setState({
                loading: false,
                email: null,
                password: null,
                inValidText: 'You are not allowed! Contact Admin',
              });
            }
          });
      })
      .catch((error) => {
        console.log(error);
        this.setState({loading: false});
        if (error.code === 'auth/user-not-found') {
          console.log('Inavlid user');
          this.email.current.focus();
          this.setState({inValidText: 'User does not exist'});
        } else if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          this.setState({inValidText: 'User invalid'});
          this.email.current.focus();
        } else if (error.code === 'auth/wrong-password') {
          console.log('Password is incorrect');
          this.password.current.focus();
          this.setState({inValidText: 'Password is incorrect'});
        } else {
          this.setState({inValidText: 'Check your network connection'});
        }
      });
  };

  changeValue = (field, value) => {
    this.setState({[field]: value});
    this.setState({[field + 'IsError']: false});
    this.setState({inValidText: ''});
  };
  openLink = (link) => {
    Linking.openURL(link);
  };
  hidePopup = () => {
    this.setState({popUp: false});
  };
  showAlert = () => {
    alert('alert');
  };
  render() {
    const {
      email,
      password,
      emailIsError,
      passwordIsError,
      inValidText,
      loading,
    } = this.state;
    return (
      <ImageBackground
        source={require('../assets/login_bg.png')}
        style={styles.container}>
        <StatusBar backgroundColor="#fac20e" />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 40,
            paddingVertical: 30,
            justifyContent: 'center',
          }}>
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
              fontFamily: 'sans-serif-condensed',
              display: inValidText ? 'flex' : 'none',
              textAlign: 'center',
            }}>
            {inValidText}
          </Text>
          <TextInput
            placeholderTextColor="black"
            placeholder="Email"
            style={[styles.input, emailIsError ? styles.error : null]}
            onChangeText={(text) => this.changeValue('email', text)}
            value={email}
            ref={this.email}
            keyboardType="email-address"
          />
          <TextInput
            placeholderTextColor="black"
            placeholder="Password"
            secureTextEntry={true}
            style={[styles.input, passwordIsError ? styles.error : null]}
            onChangeText={(text) => this.changeValue('password', text)}
            value={password}
            ref={this.password}
          />
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={this.login}>
            <Text
              style={{
                color: 'black',
                textAlign: 'center',
                fontSize: Dimensions.get('window').width / 20,
                fontFamily: 'sans-serif-condensed',
                fontWeight: '700',
                paddingVertical: 10,
              }}>
              Login
            </Text>
          </TouchableOpacity>
          <View
            style={{
              padding: 10,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                color: 'rgb(250, 204, 4)',
                fontSize: Dimensions.get('window').width / 30,
                fontFamily: 'sans-serif-condensed',
              }}
              onPress={() =>
                this.openLink('https://yellowbull.app/terms-conditions.html')
              }>
              Terms of Service
            </Text>
            <Text
              style={{
                color: 'black',
                fontSize: Dimensions.get('window').width / 30,
                fontFamily: 'sans-serif-condensed',
              }}>
              &nbsp;and&nbsp;
            </Text>
            <Text
              style={{
                color: 'rgb(250, 204, 4)',
                fontSize: Dimensions.get('window').width / 30,
                fontFamily: 'sans-serif-condensed',
              }}
              onPress={() =>
                this.openLink('https://yellowbull.app/privacy-policy.html')
              }>
              Privacy Policy
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  input: {
    backgroundColor: '#e6e4e2',
    color: 'black',
    marginBottom: 10,
    padding: 10,
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
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
