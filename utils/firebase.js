// utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// ✅ Your Firebase project config (replace if needed)
const firebaseConfig = {
  apiKey: "AIzaSyARuhFhhfrlIFYW9HMwKy3Q1IY9WHnQLaU",
  authDomain: "educational-elements.firebaseapp.com",
  projectId: "educational-elements",
  storageBucket: "educational-elements.firebasestorage.app",
  messagingSenderId: "235992766012",
  appId: "1:235992766012:web:d21c9ad6c6b44dff1c1539",
  measurementId: "G-DXLQKVST35"
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Set up Auth and Firestore with modern SDK
const auth = getAuth(app);

const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: false // ✅ use WebSockets instead of long-polling
});

export { auth, firestore };
