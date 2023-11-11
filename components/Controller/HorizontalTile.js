import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const HorizontalTile = (props) => {
  return (
    <View style={{alignItems: 'center', padding: 20}}>
      <TouchableOpacity
        activeOpacity={0.6}
        style={{
          backgroundColor: 'black',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          shadowColor: 'rgba(0,0,0,1)', // IOS
          shadowOffset: {height: 15, width: 15}, // IOS
          shadowOpacity: 1, // IOS
          shadowRadius: 5, //IOS
          elevation: 15, // Android
          borderRadius: 10,
          width: Dimensions.get('window').width - 20,
          flexDirection: 'row',
        }}
        onPress={() =>
          props.navigation.navigate('UpdateDriverDetails', {
            details: props.details,
          })
        }>
        <View style={{alignItems: 'flex-start'}}>
          <Text
            style={{
              color: 'white',
              fontSize: Dimensions.get('window').width / 15,
              fontFamily: 'sans-serif-condensed',
              textAlign: 'left',
            }}>
            {props.details.vehicleNo}
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: Dimensions.get('window').width / 20,
              fontFamily: 'sans-serif-condensed',
              textAlign: 'left',
            }}>
            {props.details.name}
          </Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="ios-arrow-forward" size={40} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default HorizontalTile;
