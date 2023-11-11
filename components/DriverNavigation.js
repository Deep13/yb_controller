import React, {Component} from 'react';
import 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import DriverDashboard from './Driver/DriverDashboard';
import Permission from './Permission';

const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();

const DriverNavigation = ({navigation}) => (
  <Stack.Navigator>
    {/* <Stack.Screen
      name="Permission"
      component={Permission}
      options={{headerShown: false}}
    /> */}
    <Stack.Screen
      name="Home"
      component={DriverDashboard}
      options={{
        headerTitleAlign: 'center',
        title: 'DriverDashboard',
        headerShown: false,
        headerLeft: false,
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

export default DriverNavigation;
