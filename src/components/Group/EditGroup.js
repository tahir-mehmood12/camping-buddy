import React, { useState, useRef } from 'react';

import classes from './EditGroup.module.css';

import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';
import parse from 'html-react-parser';

import Modal from "../Modals/Modal";
import Button from '../UI/Button';
import QuickAddMember from '../Forms/QuickAddMember';
import Avatar from './Avatar';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditMember from './EditMember';
import Alert from '../Modals/Alert';


const RenderMember = ({ member, editHandler, confirmDeleteHandler}) => {
    return (
        <div className={classes.memberContainer}>

            <div className={classes.memberLeft}>
                <Avatar key={member.id} member={member}/> 
                <div className={classes.memberDetails}>
                    <div className={classes.memberName}>{member.name}</div>
                    <div className={classes.memberEmail}>{member.email}</div>
                </div>  
            </div>
    
            <div className={classes.memberRight}>
                <Button className='noStyle' onClick={()=>editHandler(member)}>
                    <EditIcon style={{ fontSize: 30}}/>
                </Button>

                <Button className='noStyle' onClick={()=>confirmDeleteHandler(member)}>
                    <DeleteIcon style={{ fontSize: 30, opacity: (member.owner || member.email === auth.currentUser.email )? .2 : 1}}/>
                </Button>

            </div>

        </div>
                
    )
}

const EditGroup = ( { group, onConfirm} ) => {

    const [working, setWorking] = useState(false);
    const [selectedMember, setSelectedMember] = useState();
    const groupNameRef=useRef();
    const [alertMessage, setAlertMessage] = useState();
    const [confirmMessage, setConfirmMessage] = useState();

    const handleNameChange = async () => {
        const groupName=groupNameRef.current.value;
        if (!groupName){ return;} else {
            //update group name record in db
            try {
                const groupRef = doc(db, "groups", group.id);
                await updateDoc(groupRef, {
                    name:groupName
                  });
              } catch (err) {
                console.log(err);
              }
        }
    };
    
    const deleteHandler = async (id, email) => {
         
        if (working) return;
        setWorking(true);
        //make a copy of members array and remove person
        const updatedMembers = [ ...group.members ];
        const updatedMemberIds = [ ...group.memberIds ];
        const updatedMemberEmails = [ ...group.memberEmails ];
        const memberIndex = updatedMembers.findIndex(member => member.id === id);
        const memberIdIndex = updatedMemberIds.indexOf(id);
        const memberEmailIndex = updatedMemberEmails.indexOf(email);
        if (memberIndex > -1) updatedMembers.splice(memberIndex, 1);
        if (memberIdIndex > -1) updatedMemberIds.splice(memberIdIndex, 1);
        if (memberEmailIndex > -1) updatedMemberEmails.splice(memberEmailIndex, 1);
        //reassign any items 
        const updatedItems = [ ...group.items ];
        updatedItems.forEach(item => {
            item.organise.map(org => {
                if (org.assigned === id) { org.assigned = 'unassigned'}
            });
        });

        //update database
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                members: updatedMembers,
                memberIds: updatedMemberIds,
                memberEmails: updatedMemberEmails,
                items: updatedItems
            });
        } catch (err) {
            alert("There was a problem updating your group.")
        }
        setWorking(false);
    }

    const confirmDeleteHandler = (member) => {
        if (member.owner) {
            setAlertMessage({title:`Alert`, message: `You can't remove the group owner`});
        } else if (member.email === auth.currentUser.email) {
            setAlertMessage({title:`Alert`, message: `You are trying to remove yourself from this group. To leave the group, go to Settings and select Leave under the group name.`});
        } else {
            setConfirmMessage({title:`Hold on!`, message: `Are you want to remove ${member.name} from this group?`, params: {id: member.id, email: member.email}});
        }
    }

    const editHandler = async (member) => {
       setSelectedMember(member);
    }
            

    if (!group) return;

    return (

        <Modal 
            align='top' 
            back 
            title='Edit group'
            onConfirm={()=>onConfirm(false)}
            onCancel={()=>onConfirm(false)}
            >

            <input
                className={classes.nameInput}
                id="groupname"
                onBlur={handleNameChange}
                maxLength="30"
                defaultValue={group?.name}
                placeholder='Untitled group'
                ref={groupNameRef}  />
            
            {selectedMember && 
                <EditMember 
                group={group}
                member={selectedMember}
                setSelectedMember={setSelectedMember}
                />
            }
        
            <QuickAddMember group={group}/>

            <div className={classes.container}>

            { group.members.map( (member ) => (
                <RenderMember 
                    working={working}
                    confirmDeleteHandler={confirmDeleteHandler} 
                    editHandler={editHandler} 
                    key={member.id} 
                    member={member}
                    />
            ))}

            </div>

            {alertMessage && 
                <Alert 
                title={alertMessage.title}
                message={alertMessage.message}
                onConfirm={()=>{setAlertMessage();}}
                />
            }

            {confirmMessage && 
                <Alert 
                title={confirmMessage.title}
                message={confirmMessage.message}
                onConfirm={()=>{deleteHandler(confirmMessage.params?.id, confirmMessage.params?.email); setConfirmMessage();}}
                onCancel={()=>setConfirmMessage()}
                />
            }

        </Modal>


    );

}

export default EditGroup;