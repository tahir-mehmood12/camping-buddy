import { db } from '../config';
import { collection, updateDoc, where, arrayUnion, query, getDocs } from 'firebase/firestore';

export const generateId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *  charactersLength));
    }
    return result;
}

export const sendNotification = async (notification, email) => {
    if (!notification) return;
    console.log('notification',email,notification);
    const recipientEmail =  email ? email : null;
    const recipientId = notification.recipientId ? notification.recipientId : null;
    if (recipientEmail) {
        try {
            //get target user via email
            const q = query(collection(db, "users"), where("email", "==", recipientEmail));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async(document) => {
                await updateDoc(document.ref, {
                    //add to existing notifications in firebase
                    notifications: arrayUnion(notification)
                    });
               });      
        } catch (err) {
            console.log(err);
        } 
    } else if (recipientId) {
        try {
            //get target user via id
            const q = query(collection(db, "users"), where("id", "==", recipientId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async(document) => {
                await updateDoc(document.ref, {
                    //add to existing notifications in firebase
                    notifications: arrayUnion(notification)
                    });
               });      
        } catch (err) {
            console.log(err);
        } 
    }
}

