// import firebase, { ReactNativeFirebase } from "@react-native-firebase/app";
import { getApp, initializeApp } from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCntIXzsXSkeOoDyf7mYerZ6aAQgPnSwKo",
  authDomain: "folded-so.firebaseapp.com",
  projectId: "folded-so",
  storageBucket: "folded-so.firebasestorage.app",
  messagingSenderId: "126968108305",
  appId: "1:126968108305:web:0a53e1d744deff0f7e28b0",
};

// Initialize Firebase
//  let app:ReactNativeFirebase.FirebaseApp;
// if(!firebase.apps.length){
//   app = await firebase.initializeApp(firebaseConfig);
// }
// else{
//     app = firebase.app();
// }
// initializeApp(firebaseConfig);
export const app = getApp();
export const functions = getFunctions(app, "us-central1");
export const db = getFirestore(app);

export const api = async (req: {
  endpoint: string;
  data?: any;
}): Promise<any> => {
  const callable = httpsCallable(functions, req.endpoint);
  const response = await callable(req.data);
  return response.data;
};
