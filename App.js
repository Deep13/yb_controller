import React, {Component} from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';

import Home from './components/Home';
import Main from './components/Main';
import auth from '@react-native-firebase/auth';

import DriverNavigation from './components/DriverNavigation';

const Stack = createStackNavigator();
export default class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Home}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="DashboardStack"
            component={Main}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="DriverStack"
            component={DriverNavigation}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
