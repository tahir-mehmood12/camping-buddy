import React, { useState, useRef, useEffect, useContext } from 'react';

import { auth, db, AVATARS } from '../../config';
import { collection, doc, updateDoc, where, query, getDocs, Timestamp } from 'firebase/firestore';

import Button from '../UI/Button';
import Avatar from '../Group/Avatar';
import classes from './Forms.module.css';
import Alert from '../Modals/Alert';
import Loading from '../UI/Loading';
import { UserContext } from '../../store/user-context';
import { generateId, sendNotification } from '../../config/helpers';

const isEmail = (email) => {
    var regex = /^[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+(\.[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/; return regex.test(email);
  }

const EditMemberForm = ( { member, group, setSelectedMember} ) => {

    const nameRef=useRef();
    const emailRef=useRef();
    //const messageRef=useRef();
    const [selectedAvatar, setSelectedAvatar] = useState(member.avatar);
    const [editor, setEditor] = useState(member.editor);
    const [emailVerified, setEmailVerified] = useState(false);
    const [alertMessage, setAlertMessage] = useState();

    const formRef = useRef();
    const [working, setWorking] = useState(false);
    const [error, setError] = useState(false);

    const user = auth.currentUser;
    const UserCtx = useContext(UserContext);

    const fallbackCopyTextToClipboard = (text, alertText, alertTitle) => {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
      
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
      
        try {
          var successful = document.execCommand('copy');
          if (successful) {
            setAlertMessage({ title: alertTitle, message: alertText});
          } else {
            setAlertMessage({ title:"Oops", message: "We had some trouble creating a link."});
          }
        } catch (err) {
            setAlertMessage({ title:"Oops", message: "We had some trouble creating a link."});
        }
        document.body.removeChild(textArea);
      }

    const createInviteText = () => {
        //create invite link text
        const inviteText = `Hey ${nameRef.current.value ? nameRef.current.value : 'there'}! Join me on Camping Buddy to help organise stuff for ${group?.festival?.name}. https://camping-buddy-site.web.app`;
        //this is not used yet but mght be in the future
        setEditor(true); 
        //create alert message text
        const personName = nameRef.current.value ? nameRef.current.value : 'this person';
        const alertText = emailRef.current.value === '' ? `Make sure you add an email address for ${personName} so they can join the group.`:
        `A link has been copied to the clipboard. You can paste this into a message to invite ${personName} to your list.`
        const alertTitle = emailRef.current.value === '' ? 'Hang on!' : 'Invite link created!';
        //fall back for old browsers
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(inviteText, alertText, alertTitle);
            return;
        }
        navigator.clipboard.writeText(inviteText).then(function() {
            setAlertMessage({ title: alertTitle, message: alertText});
        }, function(err) {
            setAlertMessage({ title:"Oops", message: "We had some trouble creating a link. Error: "+err});
        });
    }
    

    const cancelSubmitHandler =  (event) => {
        event.preventDefault();
         setSelectedMember();
    }

    const handleKeyDown = (event) => {
        //submit form if enter key is pressed
        if (event.key === 'Enter') {
            submitHandler(event);
        }
    }

    const submitHandler = async (event) =>{
        //submit form, prevent default form functionality
        event.preventDefault();

        //set working to prevent multiple submits
        if (working) return;
        setError();
        
        //get entered values from form field (name or email address)
        const enteredName = nameRef.current.value;
        const enteredEmail = emailRef.current.value;
        //const enteredMessage = messageRef.current.value;

        //validation - check empty value
        if (!enteredName){
            setError("Please enter a name");  setWorking(false); return;
        }
         //validation - unless you are editing a member, check the member doesn't already exist in group (check for anyone with the same name or same email (if they have entered an email))
         if (group.members.find ( 
            memb => ( ( memb.id !== member.id ) && ( (memb.name === enteredName) || (enteredEmail && ( memb.email === enteredEmail )) )
            )) ) {
                setError("This person is already in the group!"); setWorking(false); return;
             }
        //get email from form field
        if (enteredEmail && isEmail(enteredEmail)===false){setError("Please enter a valid email address."); return;}

        //require email if they are set to be editor
        //if (!enteredEmail && editor){setError("Add an email address so we can invite this person to edit the list."); return;}

        //check if this is the current user
        if (user.uid === member.id) {
            //check if they want to edit their email address?
            //console.log(user.email,user.uid,member.id, 'enteredEmail', enteredEmail);
            //return;
        }
    
        //clear form
        setWorking(true);
        formRef.current.reset();
        
        //update member
        const updatedMember={
            ...member,
            name:enteredName,
            email:enteredEmail,
            avatar:selectedAvatar,
            editor:editor
          }

        //make a copy of members array and update person
        const updatedMembers = [ ...group.members ];
        const memberIndex = updatedMembers.findIndex(m => m.id === member.id);
        if (memberIndex > -1) { 
            updatedMembers[memberIndex] = updatedMember;
            //if email has been added or if it's changed then send a notification
            if ( enteredEmail && ( enteredEmail !== group.members[memberIndex].email ) ) { generateNotification(enteredEmail); }
        }

        //update the member emails array of the group - this is needed for search queries later on
        const updatedMemberEmails = [ ...group.memberEmails ];
        const memberEmailIndex = member.email ? updatedMemberEmails.indexOf(member.email) : -1;
        //update the email if it's there, otherwise add a new email
        (memberEmailIndex > -1) ?  updatedMemberEmails[memberEmailIndex] = enteredEmail : updatedMemberEmails.push(enteredEmail);

        //console.log(updatedMembers);

        //update database
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                members: updatedMembers,
                memberEmails: updatedMemberEmails
            });
        } catch (err) {
            setError("There was a problem updating the member.")
        }
        setWorking(false);
        setSelectedMember();
        
    }

    const checkEmailIsVerified = async (email) => {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        setEmailVerified(!querySnapshot.empty);
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

    useEffect(() => {
        ( member?.email ) ? checkEmailIsVerified(member.email) : setEmailVerified(false);
      }, [member])

    if (working) return (<Loading/>);

    return (

        <div className={classes.editMemberContainer}>

             <form 
             onSubmit={submitHandler} 
             ref={formRef}  
             className={classes.editMemberForm}
             onKeyDown={handleKeyDown}
             >

                <input 
                id="name" 
                required 
                defaultValue={member.name}
                className={classes.formInput}
                placeholder='Name' 
                ref={nameRef}  
                style={{'border':'none'}}
                />

                <input 
                id="email" 
                type="email"
                disabled={emailVerified}
                defaultValue={member.email}
                className={classes.formInput}
                placeholder='Email' 
                ref={emailRef}  
                style={{'border':'none'}}
                />

                {error && <div className='errorMessage'>{error}</div> }

                <p>Pick an avatar</p>

                <div className={classes.avatarsContainer}>

                    {AVATARS.map((avatar,i)=>(
                        <div className={classes.avatarContainer} 
                            key={i} 
                            onClick = {()=>setSelectedAvatar(i+1)}
                            >
                            
                        <Avatar 
                            showName='long'
                            selectedAvatar={selectedAvatar} 
                            avatar={avatar} 
                            avatarSize='huge'
                            />
                           
                        </div>
                    ))}

                <div className={classes.editorContainer}>
                <Button className='borderless' onClick={createInviteText}>
                    Create invite link
                </Button>
                </div>


                {alertMessage && 
                    <Alert 
                        title={alertMessage.title}
                        message={alertMessage.message}
                        onConfirm={() => setAlertMessage()}
                        />
                }

                </div>

                <div className={classes.submitButton}>

                    <Button 
                        className='cancel'
                        onClick={cancelSubmitHandler}
                        >
                        Cancel
                    </Button>
                    
                    <Button 
                        className='primary'
                        type="submit"
                        >
                        Done
                    </Button>
                
                </div>
                
                

            </form>

        </div>

           

    );

}

export default EditMemberForm;