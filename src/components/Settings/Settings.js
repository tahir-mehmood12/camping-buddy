import React, { useMemo, useState, useEffect, useContext } from 'react';

import classes from './Settings.module.css';
import { signOut, sendPasswordResetEmail  } from 'firebase/auth';
import { auth, db, deleteAccount} from '../../config';
import { generateId, sendNotification } from '../../config/helpers';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

import Heading from '../UI/Heading';
import Button from '../UI/Button';
import EditGroup from '../Group/EditGroup';
import icon_lock from '../../assets/icons/icon_lock.png';
import icon_notifications from '../../assets/icons/icon_notifications.png';
import icon_arrow_right from '../../assets/icons/icon_arrow_right.png';
import icon_arrow_down from '../../assets/icons/icon_arrow_down.png';
import icon_darkmode from '../../assets/icons/icon_darkmode.png';
import icon_logout from '../../assets/icons/icon_logout.png';
import icon_profile from '../../assets/icons/icon_profile.png';
import icon_right from '../../assets/icons/icon_right.png';
import avatar8 from '../../assets/avatars/circlegalah.png';
import icon_info from '../../assets/icons/icon_info.png';
import { UserContext } from '../../store/user-context';
import EditProfile from '../Forms/EditProfile';
import icon_add from '../../assets/icons/icon_add.png';
import SaveWork from '../Forms/SaveWork';
import Alert from '../Modals/Alert';
import EditFestival from '../Forms/EditFestival';


const Settings = ( { group, settings }) => {

    const [working, setWorking] = useState(false);
    const [groupEditMode, setGroupEditMode] = useState(false);
    const [receiveNotifications, setReceiveNotifications] = useState(settings?.receiveNotifications);
    //console.log('group',group);
    const [darkMode, setDarkMode] = useState(false);
    const [workingPassword, setWorkingPassword] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const UserCtx = useContext(UserContext);
    const [selectedGroup, setSelectedGroup] = useState();
    const user = auth.currentUser;
    const [alertMessage, setAlertMessage] = useState();

  const [festival, setFestival] = useState (group?.festival);

  const leaveGroup = async (userID, userEmail, _group, profileDelete) => {
    setWorking(true);

    //make a copy of members array 
    const updatedMembers = [ ..._group.members ];
    const updatedMemberIds = [ ..._group.memberIds ];
    const updatedMemberEmails = [ ..._group.memberEmails ];

    //find the member in the arrays
    const memberIndex = updatedMembers.findIndex(member => (member.id === userID || member.email=== userEmail));
    const memberIdIndex = updatedMemberIds.indexOf(userID);
    const memberEmailIndex = updatedMemberEmails.indexOf(userEmail);

    //console.log(memberIndex, memberIdIndex, memberEmailIndex);
   
    //remove member from group member arrays - remember these id and email arrays are needed so that firebase can search simple arrays
    if (memberIndex > -1) { 
        updatedMembers.splice(memberIndex, 1);
        updatedMemberIds.splice(memberIdIndex, 1);
        updatedMemberEmails.splice(memberEmailIndex, 1);
    }

    //un assign any items assigned to member
    const updatedItems = [ ..._group.items ];
    updatedItems.forEach(item => {
        item.organise.map(org => {
            if (org.assigned === userID) { org.assigned = 'unassigned' }
        });
    });

    const updatesToGroup = { 
      members: updatedMembers,
      memberIds: updatedMemberIds,
      memberEmails: updatedMemberEmails,
      items: updatedItems,
    }

    //set up notification object
    const notification = 
    { 
      id: generateId(20),
      status:'unread',
      request:false,
      recipientId: _group.owner, 
      senderName: UserCtx.settings?.name,
      senderEmail: UserCtx.settings?.email,
      text:`${UserCtx.settings?.name} has left ${_group.name ? _group.name : 'your group'}`,
      createdAt: Timestamp.fromDate(new Date())
    }
    //if the group owner is leaving the group
    if (_group.owner === userID) {
      if (updatedMemberEmails.length > 0 ) {
        //check there are valid emails in the array
        var validEmails = updatedMemberEmails.filter(email => email);
        //pass the group ownership on to the next member if they are the owner and there are others in the group
        if (validEmails && validEmails.length > 0){
          const newOwner = updatesToGroup.members.find( m => m.email == validEmails[0]);
          //see if any other members have an email set
          if (newOwner) {
            updatesToGroup.owner = newOwner.id;
            updatesToGroup.members.map( member => ( member.owner = member.id===newOwner.id));
            //update the notification to suit what's happening - send to new owner instead of owner of the group
            notification.recipientId = newOwner.id;
            notification.text = `${UserCtx.settings?.name} has left ${_group.name ? _group.name : 'the group'} and made you the owner.`;
            //send the notification if the group owner is leaving the group and there is a new owner (i.e. don't send the notification if the owner is leaving the group and there are no other members)
            sendNotification(notification, newOwner.email);
          }
        }
      }
    } else {
      //not the group owner leaving the group. Send the notification to the owner
      sendNotification(notification);
    }
    //console.log('updatesToGroup',updatesToGroup);
    //console.log('notification',notification);
    //update database
    try {
        const groupRef = doc(db, 'groups', _group.id);
        await updateDoc(groupRef, updatesToGroup);
        UserCtx.setCurrent('delete')
        //if (!profileDelete) UserCtx.setCurrent('delete')
    } catch (err) {
        alert("There was a problem updating your group.")
    }

    setWorking(false);
    setAlertMessage();
  }
  

    const handleGroupLeave = async ( userID, userEmail, groupId, profileDelete  ) => {
      if (working) return;
      //get group using ID or group object
      //groupID is used when deleting profile - we loop through groups and leave them one by one
      const _group = profileDelete ? UserCtx.groups.find(gr => gr.id === groupId) : group;
      //console.log('leaving group',_group.id);
      if (profileDelete) {
        //no need to activate confirmation when deleting profile (they have already confirmed profile delete)
        leaveGroup(userID, userEmail,_group, profileDelete);
      } else {
        setAlertMessage({
          title:`Alert`, 
          message: `Are you sure you want to leave ${_group.name ? _group.name : 'this group'}?`,
          onConfirm: ()=>leaveGroup(userID, userEmail,_group)
        });
      }
    }

    const saveFestivalToGroup = async ( festival ) => {
      if (group && group.id && !working) {
        try {
          setWorking(true);
          const groupRef = doc(db, 'groups', group.id);
          await updateDoc(groupRef, { 
            festival: festival
          });
        } catch (err) {
          alert("There was a problem updating your group. "+err)
        }
        setWorking(false);
      }
    }
    
    const handleGroupSwitch = async ( id ) => {
      UserCtx.setCurrent(id)
    }
    
    const handleDeleteProfile = async () => {
      //set these up becuase we are going to delete user
      const userID = user.uid;
      const userEmail = user.email;
      const groups = UserCtx.groups;
      if ( window.confirm("Are you absolutely sure you want to delete your profile?") == true) {
         // Delete user from user collection 
         try {
          const userRef = doc(db, 'users', userID);
          await updateDoc(userRef, { 
              email: '',
              name: ''
          });
        } catch (err) {
            alert("We've removed your user and event data from our systems. There was a problem removing your profile though. Log out of Camping Buddy and sign back in. Then try to remove your profile again. "+err)
        }
        //delete membership from all groups and reassign tasks
        groups.forEach ( async (i) => await handleGroupLeave(userID, userEmail, i.id, true));
        //delete from firebase auth
        deleteAccount(user).then(async() => {
          //success
        }).catch((err) => {
          alert("There was a problem deleting your profile.  "+err)
        });
      }
    }
    
    const saveSettings = async () => {
      //update user details in db
      try {
        const userRef = doc(db, 'users', settings.id);
        await updateDoc(userRef, { 
            receiveNotifications: receiveNotifications
        });
      } catch (err) {
          alert("There was a problem updating the user.")
      }
    }

    const handleSignout = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
      };

      const handleSendPasswordResetEmail = () => {
        if (workingPassword) return;
        setWorkingPassword(true);
        sendPasswordResetEmail(auth, user.email)
          .then(() => {
            setWorkingPassword(false);
            alert("Check your email "+user.email+" for a password reset link.");
          })
          .catch(error => {
            setWorkingPassword(false);
            alert("There was an error resetting your password: "+ error.message);
          });
      };
    
      const handleNotificationChange = () => {
        alert('functionality in develoment');
      };

      const toggleGroup = ( id ) => {
        if (selectedGroup === id ) {
            setSelectedGroup();
        } else {
            setSelectedGroup(id);
        }
    }
    const toggleShowProfile = () => {
      setShowEditProfile(!showEditProfile);
    }
   
    const handleAddFestival = () => {
      UserCtx.setCurrent('new');
    };

      const renderGroups = () => {
        if (!UserCtx) return;
        //get logged in user groups from context - from users table in database
        const groups = UserCtx.groups;
        const leavePrompt = group?.memberIds.length>1 ? 'Leave' : 'Delete event';
        return (
            groups && groups.map( ( group ) => (
                <div key={group.id} className={`${(UserCtx.current === group.id) && classes.settingsCurrent }`}>
                <Button className='flex' onClick={() => toggleGroup(group)} >
                    
                    <div className={classes.settings_button}>

                        <div className={classes.settings_buttonIconHolder}> 

                        { selectedGroup?.id === group.id ? 
                          <img src={icon_arrow_down}  alt='open' className={classes.settings_buttonToggleIcon}  /> :
                          <img src={icon_arrow_right}  alt='closed' className={classes.settings_buttonToggleIcon}  /> 
                        }

                        </div>

                        <div className={`${classes.settings_buttonText} `}> 
                          {group.festival?.name}
                          {group.name && ` (${group.name})`}
                        </div>
                    </div>
    
                </Button>
                
                { selectedGroup?.id === group.id && 
                  
                  <div className={classes.settings_editGroupHolder}>

                    { UserCtx.current === group.id && renderEditGroup(group)}

                    {/*Edit custom festival*/}
                    { UserCtx.current === group.id && group.festival?.custom && 
                      <EditFestival 
                        groupId={group.id}
                        festival={group.festival} 
                        pressHandler={saveFestivalToGroup}
                      />
                    }

                    { UserCtx.current === group.id && renderButton(leavePrompt, icon_logout, () => handleGroupLeave( user.uid, user.email)) }

                    { UserCtx.current !== group.id && renderButton('Switch to this event', icon_logout, () => handleGroupSwitch(group.id)) }
                  
                  </div> 
                }


                
                </div>
                
            )
        ));
    }

      const renderEditGroup = () => {
        if (!group) return;
        return (
            <>
            { groupEditMode ? 
            
                <EditGroup group={group} onConfirm={() => setGroupEditMode(!groupEditMode)}/> :

                <Button className='flex' onClick={() => setGroupEditMode(!groupEditMode)}>
                
                  <div className={classes.settings_button}>
                      <div className={classes.settings_buttonIconHolder}>
                        <img src={icon_info}  alt='Edit' className={`${classes.settings_buttonIcon}`}  />
                        </div>
                      <div className={classes.settings_buttonText}>Edit group</div>
                      <img src={icon_right}  alt='go' className={classes.settings_buttonArrow}  />
                  </div>

              </Button>
        
            }
            </>
        )
    }

    const renderSwitch = ( title, icon, theState, onChange) => {

      return (

      <div className={classes.switchHolder}>
        <div className={classes.settings_button}>
          <div className={classes.settings_buttonIconHolder}>
            <img src={icon}  alt={title} className={classes.settings_buttonIcon}  />
          </div>
          <div className={classes.settings_buttonText}> {title} </div>
          <label className={classes.switch}>
            <input type="checkbox" checked={theState} onChange={()=>onChange(!theState)}/>
            <span className={`${classes.slider} ${classes.round}`}></span>
          </label>
        </div>
      </div>

      )

  }
  
  const renderButton = ( title, icon, onClick, styles, working) => {

        return (
            <Button className='flex' onClick={onClick} style={styles}>
                
                <div className={classes.settings_button}>
                    <div className={classes.settings_buttonIconHolder}>
                      <img src={icon}  alt={title} className={classes.settings_buttonIcon}  />
                    </div>
                    <div className={classes.settings_buttonText}> {working ? 'Working on it...' : title} </div>
                    <img src={icon_right}  alt='go' className={classes.settings_buttonArrow}  />
                </div>

            </Button>
        )
    }

    useEffect(() => {
      if (!settings) return;
      saveSettings();
    }, [settings, receiveNotifications]);

    if (showEditProfile) return (
      <EditProfile group={group} closeHandler={toggleShowProfile} settings={settings}/>
    )

   

    if (auth.currentUser?.isAnonymous) return (

      <div className={classes.settingsContainer}>

       {/* <div className={classes.settingsHeading}>
            <div className={classes.settingsHeadingTextHolder}>
                <div className={classes.settingsHeadingText}>Settings</div>
                <div className={classes.settingsHeadingUnderline}>&nbsp;</div>
            </div>
    </div>*/}
       
        <div className={classes.settingsContent}> 
        <p>You don't have an account yet. Press the unlock button to sign up.</p>
        <SaveWork group={group} icon='unlock'/>
        </div>

        

      </div>

    )

    return (
      <div className={classes.settingsContainer}>

       {/* <div className={classes.settingsHeading}>
            <div className={classes.settingsHeadingTextHolder}>
                <div className={classes.settingsHeadingText}>Settings</div>
                <div className={classes.settingsHeadingUnderline}>&nbsp;</div>
            </div>
    </div>*/}
       
        <div className={classes.settingsContent}> 

        { /* renderSwitch('Notifications', icon_notifications, receiveNotifications, setReceiveNotifications) */} 
        
        {/* renderSwitch('Dark mode', icon_darkmode, darkMode, setDarkMode) */} 

        <div className={classes.settingsHeader}>My events</div>

        { renderGroups() }

        { renderButton('Add event', icon_add, handleAddFestival) } 

        <div className={classes.settingsHeader}>My account</div>

        { renderButton('Camping Buddy Account', icon_profile, toggleShowProfile)} 

        { renderButton('Change password', icon_lock, handleSendPasswordResetEmail, {}, workingPassword) } 

        { renderButton('Log Out', icon_logout, handleSignout) } 

        { renderButton('Delete profile', icon_logout, handleDeleteProfile) } 

        {alertMessage && 
            <Alert 
            title={alertMessage.title}
            message={alertMessage.message}
            onConfirm={alertMessage.onConfirm}
            onCancel={()=>setAlertMessage()}
            />
        }

        </div>

        

      </div>
    );

}

export default Settings;