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
export default class UpdateDriverDetails extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.handleBackButton = this.handleBackButton.bind(this);
    this.Mobile = React.createRef();
    this.state = {
      inValidText: '',
      loading: false,
      details: null,
      contactIsError: false,
      navigation: props.navigation,
    };
  }

  componentDidMount() {
    const {details} = this.props.route.params;
    firestore()
      .collection('Controller')
      .doc(details.UserID)
      .get()
      .then(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            var data = documentSnapshot.data();
            data.id = documentSnapshot.id;
            this.setState({details: data});
          }
        },
        (error) => {
          console.log(error);
        },
      );
    this.setState({details: details});
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
    console.log(this.state.details);
    this.setState({inValidText: ''});
    var text = '';
    if (!this.state.details.contact) {
      this.setState({contactIsError: true});
      text = 'Contact cannot be empty';
      this.setState({inValidText: text});
      return;
    }

    console.log('No Error');
    this.setState({loading: true});
    firestore()
      .collection('Controller')
      .doc(this.state.details.UserID)
      .set(this.state.details)
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
  };
  changeValue = (field, value) => {
    const details = {...this.state.details};

    details.contact = value;
    console.log(details);
    this.setState({details: details});
    this.setState({[field + 'IsError']: false});
    this.setState({inValidText: ''});
  };
  render() {
    const {details, inValidText, loading, status, MobileIsError} = this.state;
    return (
      <View style={styles.container}>
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
          }}>
          {inValidText}
        </Text>
        {details && (
          <View style={styles.container}>
            <View style={{paddingTop: 20, flex: 1, width: '100%'}}>
              <ScrollView contentContainerStyle={{minHeight: '100%'}}>
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>Driver name</Text>
                  <TextInput
                    placeholderTextColor="rgba(1,1,1,0.4)"
                    placeholder="Enter driver name"
                    style={styles.input}
                    value={details.name}
                    editable={false}
                  />
                </View>
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>Vehicle no</Text>
                  <TextInput
                    placeholderTextColor="rgba(1,1,1,0.4)"
                    style={styles.input}
                    value={details.vehicleNo}
                    editable={false}
                  />
                </View>
                <View style={styles.formElement}>
                  <Text style={styles.formLabel}>Mobile No:</Text>
                  <View style={{flex: 3, flexDirection: 'row'}}>
                    <TextInput
                      placeholderTextColor="rgba(1,1,1,0.4)"
                      placeholder="Vehicle no"
                      style={[
                        styles.mobile,
                        MobileIsError ? styles.error : null,
                      ]}
                      onChangeText={(text) => this.changeValue('Mobile', text)}
                      value={details.contact}
                      keyboardType="numeric"
                      ref={this.Mobile}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
            <View
              style={{
                flex: 1,
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
        )}
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
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    backgroundColor: 'white',
    color: 'black',
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
    flex: 2,
  },
});
