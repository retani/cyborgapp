import { AsyncStorage } from  'react-native'

export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`saving "${key}" failed`, error)
  }
};

export const retrieveData = async (key, callback) => {
  try {
    const value = await AsyncStorage.getItem(key, callback);
    if (value !== null) {
      return value
    }
  } catch (error) {
    console.warn(`retrieving "${key}" failed`)
  }
};
