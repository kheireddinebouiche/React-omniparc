// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDlULx3jcxYZNOgdM7IL0GbvOQ3wrirDYY",
    authDomain: "omniparc.firebaseapp.com",
    projectId: "omniparc",
    storageBucket: "omniparc.firebasestorage.app",
    messagingSenderId: "31327173841",
    appId: "1:31327173841:web:25e411173a078fd18999f0"
};
// Initialize Firebase
var app = initializeApp(firebaseConfig);
export var auth = getAuth(app);
export var db = getFirestore(app);
export var storage = getStorage(app);
export default app;
