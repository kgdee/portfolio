// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, setDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export const addInventoryItem = async (data) => {
  try {
    const { title, group, category, file, targetUrl } = data

    const storageRef = ref(storage, `inventory/${uuidv4()}/${file.name}`);

    await uploadBytes(storageRef, file) 
   
    await addDoc(collection(db, "inventory"), {
      title,
      group,
      category,
      imgUrl: await getDownloadURL(storageRef),
      targetUrl
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const getInventoryItems = async (group) => {
  try {
    const q = query(collection(db, "inventory"), where("group", "==", group));

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return data
  } catch (error) {
    console.error(error)
  }
}

export const deleteInventoryItem = async (id) => {
  try {
    await deleteDoc(doc(db, "inventory/" + id));
  } catch (error) {
    console.error(error)
  }
}

export const updateInventoryItem = async (item, updateData) => {
  try {
    const { title, group, category, file, targetUrl } = updateData

    const storageRef = ref(storage, item.imgUrl);

    file && await uploadBytes(storageRef, file)
   
    await setDoc(doc(db, "inventory/" + item.id), {
      title,
      group,
      category,
      imgUrl: file ? await getDownloadURL(storageRef) : item.imgUrl,
      targetUrl
    });
  } catch (error) {
    console.error(error)
  }
}