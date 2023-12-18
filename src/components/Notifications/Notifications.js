import React, { useContext} from 'react';
import classes from './Notifications.module.css';
import { doc, updateDoc, where, arrayUnion, getDocs, query, collection, Timestamp } from 'firebase/firestore';

import { auth, db } from '../../config';
import { generateId } from '../../config/helpers';
import { UserContext } from '../../store/user-context';
import Avatar from '../Group/Avatar';
import Button from '../UI/Button';
import SaveWork from '../Forms/SaveWork';

const Notifications = ({ settings, group}) => {
    
    /*NOTIFICATIONS ARE CREATED FOR THE FOLLOWING ACTIONS
    - Invited group member signs up for the first time - Login.js
    - Member is assigned a task e.g. Sarah asks Kellie to bring a tent - ChecklistOrganise.js
    - Member rejects assigned task request e.g. Kellie says she doesn't have a tent - Notifications.js
    - Group owner has made you the owner of a group - Settings.js
    - Someone has left the group - Settings.js
    - Someone has added you to a group - EditMemberForm.js

    NOTIFICATION OBJECT *INDICATES MANDATORY
    { 
        id: generateId(20)*,
        status:'unread'*,
        request:false,*
        recipientId: userGroup.owner, 
        senderName: enteredName*,
        senderEmail: enteredEmail,
        text:`${enteredName} has joined.`,*
        createdAt: Timestamp.fromDate(new Date())*
        item: item,
        ind:ind,
        method:methodRef.current.value, 
        assigned:assignRef.current.value, 
    }
    */

    //UNREAD NOTIFICATIONS ARE DISPLAYED HERE
    const displayNotifications = settings?.notifications?.filter(n => n.status ==='unread');
    //console.log('displayNotifications',displayNotifications)
    
    const user = auth.currentUser;
    const UserCtx = useContext(UserContext);

    const reassignItem = async (item, index) => {
        if (!item) return;
        //find which item they are editing eg tent
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        //make a copy of the existing group items array
        const updatedItems = [ ...group.items ];
        const updatedSubItem = { assigned: group.owner }
        updatedItems[itemIndex].organise[index] = updatedSubItem;
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            alert("There was a problem updating your group.")
        }
    }

    const dismissHandler = async (n) => {
        //create notification 
        const sender = group.members.find(member => (member.email && (member.email === user.email)));
        const senderName = sender ? sender.name : UserCtx.settings.name;
        const method =( n.method && n.method === '0') ? 'organise' : n.method.toLowerCase();
        const notificationText = `${senderName} has rejected your request to ${method} a ${n.item?.name?.toLowerCase()}.`;
        const notification = { 
            id: generateId(20),
            status:'unread',
            request:false,
            senderName: sender ? sender.name : UserCtx.settings.name,
            text:notificationText,
            createdAt: Timestamp.fromDate(new Date())
        } 
        //return to sender - send notification to original sender
        await sendNotificationToFirebase(n.senderEmail, notification);
        await setNotificationStatus(n,'read');
        //reassign item to group owner
        reassignItem(n.item, n.ind);
    }

    const acceptHandler = (n) => {
        setNotificationStatus(n,'read');
    }

    const sendNotificationToFirebase = async (email, notification ) => {
        //console.log(email, notification);
        if (!notification || !email) return;
        //add notification object to user record in db
        try {
            //get target user via email (not id)
            const q = query(collection(db, "users"), where("email", "==", email));
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

    const setNotificationStatus = async (n, status) => {
        //find notification they are editing
        const index = settings.notifications.findIndex(i => i.id === n.id);
        //make a copy of the existing notifications
        const updatedNotifications = [ ...settings.notifications ];
        const updatedNotification = {
            ...n,
            status:status
        }
        //update the assigned notification
        updatedNotifications[index] = updatedNotification;
        try {
        //get target user via email (not id)
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach( async(document) => {
            await updateDoc(document.ref, {
                //update notifications in firebase
                notifications: updatedNotifications
                });
            });  
        } catch (err) {
            alert("There was a problem changing this notification status.")
        } 
    }

    const Notification = ({ n }) => {
        const sender = group.members.find(member => (member.name === n.senderName || (n.senderEmail && (member.email === n.senderEmail))));
        const notificationDate = n.createdAt.toDate();
        const notificationDateString = notificationDate.toLocaleDateString();
        return (
            <div className={classes.notificationsContent}> 
                <div className={classes.notificationDate}>{notificationDateString}</div>

                <div className={classes.notificationTextContent}>
                    <Avatar 
                        key={n.id} 
                        member={sender} 
                        style={{"marginRight":"10px"}}
                        avatarSize='large'
                        /> 

                    <div className={classes.notificationText}>
                        
                            <div className={classes.mainNotificationText}>{n.text}</div>
                            
                            {n.item?.notes && <div className={classes.notificationNotes}>{n.item.notes}</div>}
                                   
                    </div>
                    <div className={classes.notificationButtons}>

                        { n.request && 
                        <Button 
                            className='reject'
                            onClick={()=>dismissHandler(n)}
                            style={{"padding":"10px 30px", "width":"auto", "marginRight":"10px", "backgroundColor":"red"}}
                            >
                            Reject
                        </Button>
                        }

                        <Button 
                            className='primary'
                            type="submit"
                            onClick={()=>acceptHandler(n)}
                            style={{"padding":"10px 30px", "width":"auto"}}
                            >
                            {n.request ? `Accept` : `OK`}
                        </Button>
                        </div>
                    
                </div> 
                
            
            </div>
        )
    }

    if (auth.currentUser.isAnonymous) return (

        <div className={classes.notificationsContainer}>

{/*        <div className={classes.notificationsHeading}>
            <div className={classes.notificationsHeadingTextHolder}>
                <div className={classes.notificationsHeadingText}>Notifications</div>
                <div className={classes.notificationsHeadingUnderline}>&nbsp;</div>
            </div>
        </div>
    */}
        <div className={classes.notificationsContent}> 

        <p>You don't have an account yet. Press the unlock button to sign up.</p>
        <SaveWork group={group} icon='unlock'/>
        </div>
      </div>

        
      )

    return (
        <div className={classes.notificationsContainer}>

       {/*        <div className={classes.notificationsHeading}>
            <div className={classes.notificationsHeadingTextHolder}>
                <div className={classes.notificationsHeadingText}>Notifications</div>
                <div className={classes.notificationsHeadingUnderline}>&nbsp;</div>
            </div>
        </div>
    */}

        {(!displayNotifications || displayNotifications?.length<1) && <div className={classes.notificationsContent}>You don't have any notifications</div>}

        {displayNotifications?.map((n,index) => <Notification key={index} n={n}/>)}

      </div>
    );

}

export default Notifications;