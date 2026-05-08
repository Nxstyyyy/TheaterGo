const API_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default API_URL;
