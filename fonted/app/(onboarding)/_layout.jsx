import { Stack } from 'expo-router'
import React from 'react'

const _layout = props => {
  return (
    <Stack screenOptions={{headerShown: false, headerBackButtonDisplayMode:'minimal'}}>
        <Stack.Screen name="(onboarding)"  options={{headerShown: false}}/>
    </Stack>
  )
}

_layout.propTypes = {

}

export default _layout
