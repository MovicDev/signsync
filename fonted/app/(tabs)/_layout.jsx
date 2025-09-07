// app/_layout.js
import { StyleSheet } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import TabBar from '../../components/TabBar';
import Feather from '@expo/vector-icons/Feather';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) =><Feather name="home" size={size} color={color}  />,
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color, size }) =><Feather name="book-open" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) =><FontAwesome6 name="user-gear"  size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) =><Feather name="settings"  size={size} color={color}/>,
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
