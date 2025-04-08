import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnKNX6SQQUvXs5pDtwMFLlNSTLkm7YvCw",
  authDomain: "retailease-a45f0.firebaseapp.com",
  projectId: "retailease-a45f0",
  storageBucket: "retailease-a45f0.firebasestorage.app",
  messagingSenderId: "943909405770",
  appId: "1:943909405770:web:e42ab60d5d266e70eb92b3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
