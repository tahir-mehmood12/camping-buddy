import React, { useState, useRef, useContext } from 'react';

import { auth, db, authEmail, linkCredential } from '../../config';
import { generateId, sendNotification } from '../../config/helpers';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

import Button from '../UI/Button';
import classes from './Forms.module.css';
import { UserContext } from '../../store/user-context';

const isEmail = (email) => {
    var regex = /^[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+(\.[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/; return regex.test(email);
  }

const getAvatarId = ( existingIDs ) => {
    //check existing avatars - get one that's not already being used in the group
    let randomNum = Math.ceil(Math.random() * 8);
    if (existingIDs?.length < 8) {
        //console.log('check',randomNum,existingIDs,existingIDs?.includes(randomNum))
        if (existingIDs?.includes(randomNum)) {
          return getAvatarId(existingIDs)
        }
    }
     return randomNum
  }


const QuickAddMember = ( { group } ) => {

    const valueRef=useRef();
    const formRef = useRef();
    const [working, setWorking] = useState(false);
    const [error, setError] = useState(false);
    const UserCtx = useContext(UserContext);

    const handleKeyDown = (event) => {
        //submit form if enter key is pressed
        if (event.key === 'Enter') {
            submitHandler(event);
        }
    }

    const submitHandler = async (event, keydown) =>{
        //submit form, prevent default form functionality
        event.preventDefault();

        //set working to prevent multiple submits
        if (working) return;
        setWorking(true);
        
        //get entered value from form field (name or email address)
        const enteredValue = valueRef.current.value;

        //validation - check empty value
        if (!enteredValue){
            setError("Please enter a name or email address");  setWorking(false); return;
        }
        //validation - check member doesn't already exist in group
        if (group.members.find ( member => ( member.name === enteredValue || member.email === enteredValue )) ) {
            setError("This person is already in the group!"); setWorking(false); return;
        }
        //clear form
        formRef.current.reset();
        //set up new member, generate id, randomly add avatar id, disable editing for now
        const avatarId = getAvatarId( group.members.map( member => member.avatar )); //console.log(avatarId);
        const newMember =  {
            id: generateId(20),
            name: enteredValue,
            editor: false,
            owner: false,
            avatar: avatarId
        }
        //if value is an email then add it as an email field also
        if (isEmail(enteredValue) ) {
            newMember.email = enteredValue.toLowerCase();
            //generate a notification
            generateNotification(newMember.email);
        }
        const newMembers = [...group.members];
        const newMemberIds = [...group.memberIds];
        const newMemberEmails = [...group.memberEmails];
        newMembers.push(newMember);
        newMemberIds.push(newMember.id);
        if (newMember.email) newMemberEmails.push(newMember.email);
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                members: newMembers,
                memberIds: newMemberIds,
                memberEmails: newMemberEmails,
            });
        } catch (err) {
            setError("There was a problem updating your group.")
        }
        setWorking(false);
    }

    const generateNotification = (email) => {

        //notify the person that they have been added to the group
        const senderName = UserCtx.settings.name;
        const senderEmail = UserCtx.settings.email;
        const notificationText = `${senderName} added you to ${group.name ? group.name : 'a new group'}. Go to the Settings tab to switch to this group.`;
        
        const notification = { 
            id: generateId(20),
            status:'unread',
            request:false,
            senderName: senderName,
            senderEmail: senderEmail,
            text: notificationText,
            createdAt: Timestamp.fromDate(new Date())
        } 
        sendNotification(notification, email);
    }

    return (

        <>
            <form 
                onSubmit={submitHandler} 
                className={classes.formFlexRow} 
                ref={formRef}
                >

                    <input 
                    id="val" 
                    required 
                    placeholder='Name or email' 
                    ref={valueRef}  
                    style={{'borderRadius':' 20px 0 0 20px', 'borderWidth':'2px', 'width':'60%'}}
                    onKeyDown={handleKeyDown}
                    />
                    
                    <Button 
                        className='primary'
                        type="submit"
                        style={{'borderRadius':'0 20px 20px 0', 'width':'40%'}}
                        >
                        Add
                    </Button>

                </form>
                 {error && <div className='errorMessage'>{error}</div> }
                 </>

    );

}

export default QuickAddMember;