// import { Platform } from 'react-native';

// const API_BASE_URL =
//   Platform.OS === 'android' && !Platform.isTV
//     ? 'http://10.0.2.2:3000'
//     : 'http://192.168.205.177:3000';

// export default API_BASE_URL;


import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // For Android emulator, use 10.0.2.2 which maps to host's localhost
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    
    // For iOS simulator and physical devices, try to get the development machine's IP
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift() || 
                        Constants.manifest?.debuggerHost?.split(':').shift();
    
    if (debuggerHost) {
      return `http://${debuggerHost}:3000`;
    }
    
    // Fallback - you may need to replace this with your actual IP address
    return 'http://192.168.1.100:3000'; // Replace with your machine's IP
  }
  
  // Production API URL
  return 'https://signsync-1-e6k3.onrender.com';
};

export const API_BASE_URL = getApiUrl();
export default { API_BASE_URL };