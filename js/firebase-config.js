
const firebaseConfig = {
    apiKey: "AIzaSyDyLM8PdOKwpzXu-SHV3YAzU28gL2QE4KY",
    authDomain: "subsieure-toolshop.firebaseapp.com",
    projectId: "subsieure-toolshop",
    storageBucket: "subsieure-toolshop.firebasestorage.app",
    messagingSenderId: "277182125256",
    appId: "1:277182125256:web:b0a98cb19d06d046ce81fd"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();  // <-- Quan trọng

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);