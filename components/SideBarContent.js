import React, {useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Drawer} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import {signOutMain} from './HelperFunction';

// const paperTheme = useTheme();
export function SideBarContent(props) {
  const signOut = async () => {
    await signOutMain('Controller');
    console.log('User signed out!');

    props.navigation.navigate('Login');
  };

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="home" color={color} size={size} />
              )}
              label="Dashboard"
              labelStyle={styles.drawerLabel}
              onPress={() =>
                props.navigation.navigate('Dashboard', {initial: false})
              }
            />
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="receipt" color={color} size={size} />
              )}
              label="All transactions"
              labelStyle={styles.drawerLabel}
              onPress={() => props.navigation.navigate('AllBookings')}
            />
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="car-child-seat" color={color} size={size} />
              )}
              label="Update driver"
              labelStyle={styles.drawerLabel}
              onPress={() => props.navigation.navigate('UpdateDriver')}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({color, size}) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          labelStyle={styles.drawerLabel}
          onPress={signOut}
        />
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  drawerLabel: {
    fontSize: Dimensions.get('window').width / 24,
    fontFamily: 'sans-serif-condensed',
  },
});
