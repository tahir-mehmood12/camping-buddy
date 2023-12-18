import React, { useState, useRef } from 'react';

import { db, authEmail, linkCredential } from '../../config';
import { generateId } from '../../config/helpers';

import { doc, updateDoc } from 'firebase/firestore';

import Button from '../UI/Button';
import classes from './Forms.module.css';

const isEmail = (email) => {
    var regex = /^[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+(\.[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/; return regex.test(email);
  }

const EditMember = ( { group } ) => {

    const valueRef=useRef();
    const formRef = useRef();
    const [working, setWorking] = useState(false);

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
            alert("Please enter a name or email address");  setWorking(false); return;
        }
        //validation - check member doesn't already exist in group
        if (group.members.find ( member => ( member.name === enteredValue || member.email === enteredValue )) ) {
            alert("This person is already in the group!"); setWorking(false); return;
        }
        //clear form
        formRef.current.reset();
        //set up new member, generate id, randomly add avatar id, disable editing for now
        const avatarId = Math.ceil(Math.random() * 8); console.log(avatarId);
        const newMember =  {
            id: generateId(20),
            name: enteredValue,
            editor: false,
            owner: false,
            avatar: avatarId
        }
        //if value is an email then add it as an email field also
        if (isEmail(enteredValue) ) newMember.email = enteredValue.toLowerCase();
        const newMembers = [...group.members];
        newMembers.push(newMember);
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                members: newMembers
            });
        } catch (err) {
            alert("There was a problem updating your group.")
        }
        setWorking(false);
    }

    return (

            <form onSubmit={submitHandler} className={classes.formFlexRow} ref={formRef}>

                    <input 
                    id="val" 
                    required 
                    placeholder='Name or email' 
                    ref={valueRef}  
                    style={{'borderRadius':' 20px 0 0 20px', 'width':'calc(60% - 20px)'}}
                    onKeyDown={handleKeyDown}
                    />
                    
                    <Button 
                        className='primary'
                        type="submit"
                        style={{'borderRadius':'0 20px 20px 0', 'width':'calc(40% - 20px)'}}
                        >
                        Add
                    </Button>

                </form>

    );

}

export default EditMember;