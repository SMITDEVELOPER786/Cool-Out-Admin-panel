import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTqXqhHOGh0UirjlTphFTZp8X1-VjI1tU",
  authDomain: "cool-out-app.firebaseapp.com",
  projectId: "cool-out-app",
  storageBucket: "cool-out-app.firebasestorage.app",
  messagingSenderId: "1024042145147",
  appId: "1:1024042145147:web:0bb3bfa2aa39d33d65d9de",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
export const auth = getAuth(app);





 
