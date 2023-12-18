import React, { useState, useRef } from 'react';

import { auth, db, updateFBEmail} from '../../config';
import { doc, updateDoc } from 'firebase/firestore';

import classes from './Forms.module.css';
import Modal from '../Modals/Modal';

const isEmail = (email) => {
    var regex = /^[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+(\.[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/; return regex.test(email);
  }

const EditProfile = ( { group, closeHandler, settings } ) => {

    const user = auth.currentUser;
    const nameRef=useRef();
    const emailRef=useRef();
    const [msg, setMsg] = useState();
    const [working,setWorking] = useState(false);

    const saveProfile = async () => {

        //get name from form field
        const enteredName = nameRef.current.value;
        if (!enteredName){
            setMsg("Please enter a name"); 
            return false;
        }
        
        //get email from form field
        /*const enteredEmail = emailRef.current.value;
        if (enteredEmail && isEmail(enteredEmail)===false){
            setMsg("Please enter a valid email address"); 
            return false;
        }*/

        setMsg("Working ... ");
        setWorking(true);
        

       /* //update name/email in group memberships
        //copy members array from current group
        const updatedMembers = [...group.members];
        const memberIndex = group.members.findIndex( member => member.id === user.uid );
        const updatedMember={
            ...group.members[memberIndex],
            name: enteredName,
            //email:enteredEmail
        }
        updatedMembers[memberIndex] = updatedMember;
        try {
            //write updated membership to db
            const groupRef = doc(db, "groups", group.id);
            await updateDoc(groupRef, {
                members: updatedMembers
                });
        } catch (err) {
            console.log(err);
        }*/

        //add name and email to user record in db
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                //email:enteredEmail,
                name: enteredName
                });
            } catch (err) {
            console.log(err);
        } 

        /*if (settings.email !== enteredEmail ){
            //update email in firebase user auth
            updateFBEmail(user, enteredEmail).then(() => {
                setWorking(false); 
              }).catch((error) => {
                console.log('error',error);
                alert(`Your log in email for Camping Buddy wasn't reset, only your email set up in your group (${group.name}). We are still working on this.`);
                setWorking(false); 
              });
        } */
        setWorking(false);  
    }


      const submitHandler = async (event) =>{
        //submit form, prevent default form functionality
        event.preventDefault();
        if (working) return;
        saveProfile();
        closeHandler();
      }

    return (
        <div className={classes.container}>

                <Modal 
                align='top' 
                back 
                title={'My Camping Buddy Account'}
                onConfirm={submitHandler}
                onCancel={closeHandler}
                >

                <form>

                    <div className='loginButton inputDiv'>
                        <input 
                        id="name" 
                        required 
                        placeholder='Your name' 
                        ref={nameRef}  
                        defaultValue={settings && settings.name}
                        />
                    </div>
                        
                   {/* <div className='loginButton inputDiv'>
                        <input 
                        type="email" 
                        id="email" 
                        disabled
                        placeholder='Your email' 
                        defaultValue={settings && settings.email}
                        ref={emailRef}  
                        />
                    </div>*/}

                    <p>{msg}</p>

                </form>

            </Modal>
            
        </div>
    );

}

export default EditProfile;