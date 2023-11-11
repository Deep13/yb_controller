import React, {Component} from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {SideBarContent} from './SideBarContent';
import Dashboard from './Controller/Dashboard';
import AllBookings from './Controller/AllBookings';
import BookingDetail from './Controller/BookingDetail';
import AddDriver from './Controller/AddDriver';
import TrackDriver from './Controller/TrackDriver';
import UpdateDriver from './Controller/UpdateDriver';
import UpdateDriverDetails from './Controller/UpdateDriverDetails';
import Permission from './Permission';

import Icon from 'react-native-vector-icons/Ionicons';
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = ({navigation}) => (
  <Stack.Navigator>
    {/* <Stack.Screen
      name="Permission"
      component={Permission}
      options={{headerShown: false}}
    /> */}
    <Stack.Screen
      name="Dashboard"
      component={Dashboard}
      options={{
        headerTitleAlign: 'center',
        title: 'Dashboard',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Icon.Button
            name="md-menu"
            size={25}
            color="black"
            iconStyle={{fontWeight: 700}}
            backgroundColor="rgb(250, 204, 4)"
            onPress={() => {
              navigation.openDrawer();
            }}
          />
        ),
      }}
    />
    <Stack.Screen
      name="AllBookings"
      component={AllBookings}
      options={{
        headerTitleAlign: 'center',
        title: 'Transactions',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Icon.Button
            name="md-menu"
            size={25}
            color="black"
            iconStyle={{fontWeight: 700}}
            backgroundColor="rgb(250, 204, 4)"
            onPress={() => {
              navigation.openDrawer();
            }}
          />
        ),
      }}
    />
    <Stack.Screen
      name="BookingDetail"
      component={BookingDetail}
      options={{
        headerTitleAlign: 'center',
        title: 'Transaction',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Icon.Button
            name="md-menu"
            size={25}
            color="black"
            iconStyle={{fontWeight: 700}}
            backgroundColor="rgb(250, 204, 4)"
            onPress={() => {
              navigation.openDrawer();
            }}
          />
        ),
      }}
    />
    <Stack.Screen
      name="AddDriver"
      component={AddDriver}
      options={{
        headerTitleAlign: 'center',
        title: 'Add driver',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Icon.Button
            name="md-menu"
            size={25}
            color="black"
            iconStyle={{fontWeight: 700}}
            backgroundColor="rgb(250, 204, 4)"
            onPress={() => {
              navigation.openDrawer();
            }}
          />
        ),
      }}
    />
    <Stack.Screen
      name="TrackDriver"
      component={TrackDriver}
      options={{
        headerTitleAlign: 'center',
        title: 'Track driver',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    />
    <Stack.Screen
      name="UpdateDriver"
      component={UpdateDriver}
      options={{
        headerTitleAlign: 'center',
        title: 'Driver',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <Icon.Button
            name="md-menu"
            size={25}
            color="black"
            iconStyle={{fontWeight: 700}}
            backgroundColor="rgb(250, 204, 4)"
            onPress={() => {
              navigation.openDrawer();
            }}
          />
        ),
        headerRight: () => (
          <Icon.Button
            name="md-add"
            size={25}
            color="black"
            iconStyle={{fontWeight: 700}}
            backgroundColor="rgb(250, 204, 4)"
            onPress={() => {
              navigation.navigate('AddDriver');
            }}
          />
        ),
      }}
    />
    <Stack.Screen
      name="UpdateDriverDetails"
      component={UpdateDriverDetails}
      options={{
        headerTitleAlign: 'center',
        title: 'Update Driver',
        headerShown: true,
        headerTintColor: 'black',
        headerStyle: {
          backgroundColor: 'rgb(250, 204, 4)',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    />
  </Stack.Navigator>
);
const Main = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBarContent {...props} />}
      unmountOnBlur={true}>
      <Drawer.Screen name="DashboardStack" component={MainStackNavigator} />
    </Drawer.Navigator>
  );
};

export default Main;
