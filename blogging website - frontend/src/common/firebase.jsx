import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5TiNO9J_UmHKyavcSkAWFptMT-YrU6Ds",
    authDomain: "mern-blog-website-master.firebaseapp.com",
    projectId: "mern-blog-website-master",
    storageBucket: "mern-blog-website-master.appspot.com",
    messagingSenderId: "734788694731",
    appId: "1:734788694731:web:0acb7dc3b9bb1e88d7a14e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Google Auth
const provider = new GoogleAuthProvider()

const auth = getAuth();

export const authWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth, provider)
        .then((result) => {
            user = result.user;
        })
        .catch((error) => {
            console.log(error);
        });
    return user;
}