import { initializeApp } from 'firebase/app';
import { getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDZq2w9_wbeb2w_8HB0mhkXBAVEaJTQNCY",
    authDomain: "tarang-app.firebaseapp.com",
    projectId: "tarang-app",
    storageBucket: "tarang-app.firebasestorage.app",
    messagingSenderId: "492216511640",
    appId: "1:492216511640:web:68e212cba9e075782474ed"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
