import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
var usersSubscriber = [];
export const signOutMain = async (type) => {
  let fcmToken = await AsyncStorage.getItem(type + 'fcmToken');
  await AsyncStorage.removeItem('DriverfcmToken');
  await AsyncStorage.removeItem('ControllerfcmToken');
  await usersSubscriber.forEach((subscriber) => subscriber());
  const {currentUser} = auth();

  console.log('fcmToken', fcmToken);
  firestore()
    .collection('controllerNotificationToken')
    .doc(currentUser.uid)
    .update({
      token: firestore.FieldValue.arrayRemove(fcmToken),
      type: type,
    })
    .then(() => {
      console.log('Token removed!');
      auth().signOut();
    });

  return;
};
export const setSubscriber = (func) => {
  usersSubscriber.push(func);
};
