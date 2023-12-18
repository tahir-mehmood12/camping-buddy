import React, { useState, useRef} from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInAnonymously} from 'firebase/auth';
import { auth, db } from '../config';
import { collection, doc, setDoc, addDoc, updateDoc, where, query, Timestamp, getDocs } from 'firebase/firestore';

import { Checkbox } from 'semantic-ui-react';
import Button from '../components/UI/Button';
import Heading from '../components/UI/Heading';
import Loading from '../components/UI/Loading';
import { CATEGORIES } from '../config';
import logoImage from '../assets/logos/pwtp_black.png';
import { generateId, sendNotification } from '../config/helpers';

import Page from '../components/Modals/Page';
import Alert from '../components/Modals/Alert';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import koala from '../assets/avatars/koala_login.png';
const isEmail = (email) => {
    var regex = /^[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+(\.[_a-zA-ZáéíñóúüÁÉÍÑÓÚÜ0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/; return regex.test(email);
  }

const Login = () => {
    
    const emailRef=useRef();
    const nameRef=useRef();
    const passwordRef=useRef();
    const [working, setWorking] = useState(false);
    const [mode, setMode] = useState('Log in');

    const [agree, setAgree] = useState(false);
    const [showResearchModal, setShowResearchModal] = useState(false);
    const [consent, setConsent] = useState(false);

    const [alertMessage, setAlertMessage] = useState();

    const [passwordVisible, setPasswordVisible] = useState(false);

    const addNewUser = async (user, enteredEmail, enteredName) => {
      try {
        //add new user to users collection
        const newUserRef = await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email: enteredEmail,
          name: enteredName,
          receiveNotifications: false,
          activeOrganiser: false, //whether they have clicked on any items to organise stuff
          createdAt: Timestamp.fromDate(new Date())
        });
        return true;
      } catch (err) {
        setAlertMessage({ title:"Error", message: err.message});
        return false;
      }
    }

    const addNewGroup = async (user, enteredName) => {
      //add new group to group collection
      try {
        const newGroupRef = await addDoc(collection(db, 'groups'), {
          id: '123',
          owner: user.uid,
          memberIds: [user.uid], //member ids only for queries later on
          memberEmails: [user.email], //member emails only for queries later on
          categories: CATEGORIES,
          members: [
            {
              id: user.uid,
              email:user.email, 
              name:enteredName, 
              avatar: 1,
              editor: true,
              owner: true
            }
          ], //set up membership for group
          createdAt: Timestamp.fromDate(new Date())
        });
        //add the auto generated id to the created group
        if (newGroupRef && newGroupRef.id) {
          const groupRef = doc(db, 'groups', newGroupRef.id);
          await updateDoc(groupRef, { id: newGroupRef.id});
          console.log('new group',newGroupRef.id);
        }
        return true;
      } catch (err) {
        setAlertMessage({ title:"Error", message: err.message});
        return false;
      }
  }

   
    const launchGuestHandler = () => {
      if (!consent || !agree) {
        setAlertMessage({ title:"Hold on!", message: "Hey you need to check you agree to our terms and conditions first!"});
        return false;
      }
      setWorking(true);
      signInAnonymously(auth)
      .then(async (userCredential) => {
        setWorking(false);
        //created account, now write to DB
        const userAdded = await addNewUser(userCredential.user, null, 'Guest');
         //create group in DB
         const groupAdded = await addNewGroup(userCredential.user, 'Guest');
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const alertText = 'Sorry! Signing in as a guest did not work. '+errorCode+errorMessage;
        setAlertMessage({ title:"Error", message: alertText});
        setWorking(false);
      });
    }

    const submitHandler = async (event) =>{
        //submit form, prevent default form functionality
        event.preventDefault();

        //get email from form field
        const enteredEmail = emailRef.current.value ? emailRef.current.value.toLowerCase() : null;
        if (enteredEmail && isEmail(enteredEmail)===false){
          setAlertMessage({ title:"Error", message: "Please enter a valid email address"});
          return;
        }

        setWorking(true);

        if (mode ==='Reset password') {
          //forgot password
          sendPasswordResetEmail(auth, enteredEmail)
          .then(() => {
            setWorking(false);
            setMode('Log in');
          })
          .catch(error => 
            {
              setAlertMessage({ title:"Error", message: error.message});
              setWorking(false);
            });

        } else {

          //get password from form field
          const enteredPassword = passwordRef.current.value;
          if (enteredPassword===""){ 
            setAlertMessage({ title:"Hold on!", message: "Please enter a password"});
            setWorking(false); 
            return; 
          }

          if (mode ==='Log in') {

            //try signing in with email and password
            signInWithEmailAndPassword(auth, enteredEmail, enteredPassword)
            .then((userCredential) => {
              // Signed in
            })
            .catch((error) => {
              const errorCode = error.code;
              let errorMessage = error.message;
              switch (errorCode) {
                case 'auth/user-not-found' :
                  errorMessage = "We can't find a user with this email address"; break;
                case 'auth/wrong-password' :
                  errorMessage = "Password is incorrect"; break;
                case 'auth/too-many-requests' :
                  errorMessage = "Too many failed login attempts. Try again later or reset your password."; break;
                default: errorMessage = "General error with sign in. Error code: "+errorCode;
               }
              setAlertMessage({ title:"Oops", message: errorMessage});
              setWorking(false);
            });

          } else if (mode ==='Sign up')  {

              if (!consent || !agree) {
                setAlertMessage({ title:"Hold on!", message: "Hey you need to check you agree to our terms and conditions first!"});
                setWorking(false);
                return false;
              }

              //get name from form field
              const enteredName = nameRef.current.value;
              if (!enteredName){
                setAlertMessage({ title:"Hold on!", message: "Please enter your name."});
                return;
              }

              //try creating an account with email and password
              createUserWithEmailAndPassword(auth, enteredEmail, enteredPassword)
              .then( async (userCredential) => {
                  setWorking(false);
                  //created account, now write to DB
                  const userAdded = await addNewUser(userCredential.user, enteredEmail, enteredName);

                  //see if this user's email has already been added to any groups;
                  const userGroups = [];
                  const enteredEmailLC = enteredEmail.toLowerCase(); 
                  const q = query(collection(db, "groups"), where("memberEmails", "array-contains", enteredEmailLC));
                  const querySnapshot = await getDocs(q);
                  querySnapshot.forEach((doc) => {
                    userGroups.push(doc.data());
                  });

                  //if the user doesn't have any groups assigned then create a new group
                  if (userGroups.length===0) await addNewGroup(userCredential.user, enteredName);

                  //if the user has groups then send a notification to the group's owner that they have joined
                  userGroups.length>0 && userGroups.map (userGroup => {
                    sendNotification({ 
                      id: generateId(20),
                      status:'unread',
                      request:false,
                      recipientId: userGroup.owner, 
                      senderName: enteredName,
                      senderEmail: enteredEmail,
                      text:`${enteredName} has joined.`,
                      createdAt: Timestamp.fromDate(new Date())
                    })
                  });
                  
                  /*//The new user's email has been found in some existing groups. 
                  //Now update their group member id with their new user id
                  userGroups.length>0 && userGroups.forEach( async (group) => {
                    //make a copy of group members array 
                    const updatedMembers = [ ...group.members ];
                    //find the member of the existing group which matches the email of the newly signed up user
                    const member = updatedMembers.find(m => m.email === enteredEmail);
                    const memberIndex = updatedMembers.findIndex(m => m.email === enteredEmail);
                    //update member id of the group member to match the new user's id
                    const updatedMember={
                      ...member,
                      id: userCredential.user.uid
                    }
                    updatedMembers[memberIndex] = updatedMember;
                    //also update the memberId array to replace the old id with the newly signed up user's ID
                    const updatedMemberIds = [ ...group.memberIds ];
                    const memberIdIndex = updatedMemberIds.findIndex(m => m.id === member.id);
                    updatedMemberIds[memberIdIndex] = userCredential.user.uid;
                    //also reassign any tasks for the old id to the newly signed up user's ID
                    const updatedItems = [ ...group.items ];
                    updatedItems.forEach( ( item ) => {
                      item.organise.forEach ( org => {
                        if (org.assigned === member.id) {org.assigned = userCredential.user.uid}
                      } );
                    })
                    //now update database
                    try {
                      const groupRef = doc(db, 'groups', group.id);
                      await updateDoc(groupRef, { 
                          members: updatedMembers,
                          memberIds: updatedMemberIds,
                          items: updatedItems
                      });
                    } catch (err) {
                        console.log("There was a problem updating the member.")
                    }
                  });*/
                  

                }).catch((error) => {
                  const errorCode = error.code;
                  let errorMessage = error.message;
                  switch (errorCode) {
                    case 'auth/email-already-in-use' :
                      errorMessage = "This email is already in use."; break;
                    case 'auth/weak-password' :
                      errorMessage = "Password should be at least 6 characters."; break;
                    case 'auth/too-many-requests' :
                      errorMessage = "Too many failed login attempts. Try again later or reset your password."; break;
                    default: errorMessage = "General error with creating an account. Error code: "+errorCode;
                   }
                   setAlertMessage({ title:"Error", message: errorMessage});
                  setWorking(false);
                });

          }
        }
      };

      if (working) return (
        <Loading msg='Hold on one sec...'/>
      )

      return (

        <div className='container bg'>
  
                <form onSubmit={submitHandler} className="loginForm">

                <div className="launchLogoHolder">
                  <img src={logoImage} className="launchLogo" alt="Party with the Planet"/>
                </div>


                <Heading>

                  CAMPING BUDDY

                </Heading>

                <div className='tagline'>

                  {mode==='Sign up' && <>Sign Up </>}
                  {mode==='Log in' && <>Log in to continue packing</>}
                  {mode==='Reset password' && <>Reset password</>}

                </div>

                { /*Name required if signing up*/
                mode==='Sign up' && 
                  <div className='loginButton inputDiv'>
                    <input 
                    id="name" 
                    required 
                    placeholder='Name' 
                    ref={nameRef}  
                    spellCheck='false'
                    />
                    </div>
                }
                
                <div className='loginButton inputDiv'>
                  <input 
                  type="email" 
                  id="email" 
                  required 
                  placeholder='Email' 
                  ref={emailRef} 
                  spellCheck='false' 
                  />
                </div>

                { /*Password required in sign up and login modes */
                (mode==='Sign up' || mode==='Log in')  && 
                <div className='loginButton inputDiv passwordInputDiv'>
                  <input 
                      type={passwordVisible ? 'text' : 'password'} 
                      id="password" 
                      required 
                      spellCheck='false'
                      placeholder='Password' 
                      ref={passwordRef}  
                      />
                      {passwordVisible ? 
                        <VisibilityOutlinedIcon
                        className="passwordVisibilityIcon" 
                        style={{ color: "#999999", fontSize: 30}}
                        onClick={()=>setPasswordVisible(!passwordVisible)} 
                        /> : 
                        <VisibilityOffOutlinedIcon
                        className="passwordVisibilityIcon" 
                        style={{ color: "#999999", fontSize: 30}}
                        onClick={()=>setPasswordVisible(!passwordVisible)} 
                        />
                      } 
                  
                </div>
                  
                }

                <div className='headerImage'>
                  <img src={koala} alt='Koala' />
                </div>

                {/*Submit button */
                  <div className='loginButton'>
                    
                    <Button className='primary' type="submit">
                        {mode}
                    </Button>

                    </div>
                }

                {/*Show login option if in sign up or reset password mode */
                ( mode==='Sign up' || mode==='Reset password' ) && 
                  <div className='flexRow'>
                  Already have an account?
                  <Button 
                    className='borderless'
                    onClick={() => setMode('Log in')}
                    >
                    Login
                  </Button>
                </div>
                }

                 {/*Show sign up  in log in mode*/
                mode==='Log in' && 
                <>

                 <div className='flexRow'>
                    Don't have an account?
                    <Button 
                      className='borderless'
                      onClick={() => setMode('Sign up')}
                      >
                      Sign up
                      </Button>
                  </div>

                </>
                 
                }
                  
                {/*Show check boxes if signing up or logging in */
                 (mode==='Sign up' || mode==='Log in') && 
                  <div className="pledgeCheckboxHolder">
                    <div className="pledgeCheckbox">
                    <Checkbox defaultChecked={consent} onClick={()=>setConsent(!consent)} label={<label>I am over 16 years of age and consent to having my data shared with a <div className='underlinedInlineLink' onClick={()=>setShowResearchModal(!showResearchModal)}>QUT-led research project</div></label>} />
                    </div>
                    <div className="pledgeCheckbox">
                    <Checkbox defaultChecked={agree} onClick={()=>setAgree(!agree)} label={<label>I agree to the <a href='https://www.partywiththeplanet.org/terms_of_service' target="_blank" rel="noreferrer">Terms of Service</a></label>} />
                    </div>
                  </div>
                }

                {showResearchModal && 
                  <Page 
                  setShowPage={setShowResearchModal} 
                  id='WGMeJ4lTAE6fByd1LVHl'
                  />
                }


                {/*Show guest and reset options in log in mode*/
                mode==='Log in' && 
                <>


                  <Button 
                      className='borderless'
                      onClick={launchGuestHandler}
                      >
                      Continue as guest
                    </Button>
                 
                 
                
                  <Button 
                  className='borderless'
                  onClick={() => setMode('Reset password')}
                  >
                  Forgot your password?
                  </Button>
                </>
                 
                }

                </form>

                {alertMessage && 
                  <Alert 
                  title={alertMessage.title}
                  message={alertMessage.message}
                  onConfirm={() => setAlertMessage()}
                  />
                }

        </div>

    );

}

export default Login;