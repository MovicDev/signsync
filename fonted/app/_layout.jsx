import { Stack } from 'expo-router'
import React from 'react'

const MainRoot = () => {
  return (
    <>
      <Stack screenOptions={{headerShown: false, headerBackButtonDisplayMode:'minimal'}}>
        <Stack.Screen name="(tabs)"  options={{headerShown: false}}/>
    </Stack>
    </>
  )
}

export default MainRoot
