import React, { useState, useRef } from 'react';

import { auth, db, authEmail, linkCredential } from '../../config';
import { doc, updateDoc } from 'firebase/firestore';

import Alert from '../Modals/Alert';
import Button from '../UI/Button';
import classes from './Forms.module.css';
import Modal from '../Modals/Modal';
import icon_share from '../../assets/icons/icon_share.png';
import SaveIcon from '@mui/icons-material/Save';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const isEmail = (email) => {
    var regex = /^[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+(\.[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/; return regex.test(email);
  }

const SaveWork = ( { group, icon, buttonProp } ) => {
  
    const user = auth.currentUser;
    const nameRef=useRef();
    const emailRef=useRef();
    const passwordRef=useRef();
    const [showForm, setShowForm] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [msg, setMsg] = useState();
    
    
    let _icon = null;
    switch (icon) {
      case 'save': _icon =  <SaveIcon  style={{ fontSize: 30 }}/>; break;
      case 'share': _icon =  <img src={icon_share}  alt='Share'  className={classes.icon_share} />; break;
      case 'unlock': _icon =  <LockOpenIcon  style={{ fontSize: 30 }}/>; break;
      default: _icon =   <SaveIcon  style={{ fontSize: 30 }}/>;
    }

    const convertAnonymousUser = async () => {

        //get name from form field
        const enteredName = nameRef.current.value;
        if (!enteredName){
            setMsg("Please enter a name"); 
            return false;
        }
        
        //get email from form field
        const enteredEmail = emailRef.current.value;
        if (enteredEmail && isEmail(enteredEmail)===false){
            setMsg("Please enter a valid email address"); 
            return false;
        }

        //get password from form field
        const enteredPassword = passwordRef.current.value;
        if (enteredPassword===""){ 
            setMsg("Please enter a password"); 
            return false; 
        }

        setMsg("Working ... ");

        //convert anon user to permanent user
        var credential = authEmail.credential(enteredEmail, enteredPassword);
          linkCredential(user, credential)
            .then( async(usercred) => {
                const user = usercred.user;
                console.log("Anonymous account successfully upgraded", user);
                setMsg("Account created. Now saving ... ");
                setShowForm(false);
                //add email to group membership
                //copy members array from current group
                const updatedMembers = [...group.members];
                //update previously anon member's email address in group
                const memberIndex = group.members.findIndex( member => member.id === user.uid );
                const updatedMember={
                    ...group.members[memberIndex],
                    name: enteredName,
                    email:enteredEmail
                }
                updatedMembers[memberIndex] = updatedMember;

                //update the member emails array of the group - this is needed for search queries later on
                const updatedMemberEmails = [ ...group.memberEmails ];
                updatedMemberEmails.push(enteredEmail);

                try {
                    //write updated membership to db
                    const groupRef = doc(db, "groups", group.id);
                    await updateDoc(groupRef, {
                        members: updatedMembers,
                        memberEmails: updatedMemberEmails
                      });
                  } catch (err) {
                    console.log(err);
                  }
                //add email to user record in db
                try {
                    const userRef = doc(db, "users", user.uid);
                    await updateDoc(userRef, {
                        email:enteredEmail,
                        name: enteredName
                      });
                  } catch (err) {
                    console.log(err);
                  }
                return user; 
            }).catch((error) => {
                const errorCode = error.code;
                let errorMessage = error.message;
                switch (errorCode) {
                case 'auth/email-already-in-use' :
                    errorMessage = "This email is already in use."; break;
                    case 'auth/provider-already-linked' :
                    errorMessage = "This email is already in use."; break;
                case 'auth/weak-password' :
                    errorMessage = "Password should be at least 6 characters."; break;
                case 'auth/too-many-requests' :
                    errorMessage = "Too many failed login attempts. Try again later or reset your password."; break;
                default: errorMessage = "General error with creating an account. Error code: "+errorCode;
                }
                setMsg(errorMessage);
                return false; 
            })
    }

    const cancelSaveHandler =  () => {
        setMsg();
        setShowForm(false);
      };

    const handleSave = async () => {
        //check whether current user is logged in as guest
        if (user.isAnonymous) {
            //show sign up form
            setShowForm(true);
        } else {
            saveData();
        } 
        
      };

      const saveData = () => {
        //save data
        setShowSaved(true)
      }

      const submitHandler = async (event) =>{
        //submit form, prevent default form functionality
        event.preventDefault();
        //update anonymous account with entered email and password
        const updatedUser = await convertAnonymousUser();
        console.log('updatedUser',updatedUser);
      }

      if (showSaved) return (
        <Alert 
            title="You're all set!"
            message="We've successfully saved your progress."
            onConfirm={()=>setShowSaved(false)}
        />
      )

    if (user.isAnonymous) return (

        <div className={classes.container}>

           <Button className='flex' onClick={handleSave}>

                { buttonProp ? 

                  buttonProp : 

                  <div className='actionButton'>
                      {_icon}
                  </div>

                }

              </Button>

            {showForm && 

                <Modal 
                align='top' 
                back 
                title={'Sign up'}
                onConfirm={submitHandler}
                onCancel={cancelSaveHandler}
                veryTop
                >

                <form>

                    <p>Sign up to continue.</p>

                    <div className='loginButton inputDiv'>
                        <input 
                        id="name" 
                        required 
                        placeholder='Your name' 
                        ref={nameRef}  
                        />
                    </div>
                        
                    <div className='loginButton inputDiv'>
                        <input 
                        type="email" 
                        id="email" 
                        required 
                        placeholder='Your email' 
                        ref={emailRef}  
                        />
                    </div>

                    <div className='loginButton inputDiv'>
                        <input 
                        type="password" 
                        id="password" 
                        required 
                        placeholder='Your password' 
                        ref={passwordRef}  
                        />
                    </div>

                    <p>{msg}</p>


                </form>

            </Modal>
                
            }

            
        </div>
    );

}

export default SaveWork;