import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCnKNX6SQQUvXs5pDtwMFLlNSTLkm7YvCw",
  authDomain: "retailease-a45f0.firebaseapp.com",
  projectId: "retailease-a45f0",
  storageBucket: "retailease-a45f0.firebasestorage.app",
  messagingSenderId: "943909405770",
  appId: "1:943909405770:web:e42ab60d5d266e70eb92b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
