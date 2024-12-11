import { initializeApp } from 'firebase/app';
import { getFirestore} from 'firebase/firestore';

/* const firebaseConfig = {
    apiKey: "AIzaSyDZq2w9_wbeb2w_8HB0mhkXBAVEaJTQNCY",
    authDomain: "tarang-app.firebaseapp.com",
    projectId: "tarang-app",
    storageBucket: "tarang-app.firebasestorage.app",
    messagingSenderId: "492216511640",
    appId: "1:492216511640:web:68e212cba9e075782474ed"
  }; */

  const firebaseConfig = {
    apiKey: "AIzaSyBmbribUy0U-0IpDpUwMewKf1RdCd_y08g",
    authDomain: "tarang-c2705.firebaseapp.com",
    projectId: "tarang-c2705",
    storageBucket: "tarang-c2705.firebasestorage.app",
    messagingSenderId: "165713778974",
    appId: "1:165713778974:web:407c550f93f7b6a9b3110f"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
