import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const WelcomeComponent = () => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text>SigninForm</Text>
      </View>
    </SafeAreaView>
  )
}

export default WelcomeComponent

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#655451',
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    height:'100%',
  }
})