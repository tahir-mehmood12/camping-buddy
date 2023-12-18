import React, { useRef, useState, useContext, useEffect } from 'react';

import Button from '../UI/Button';
import classes from './Forms.module.css';
import Alert from '../Modals/Alert';

import icon_complete from '../../assets/icons/icon_complete.png';
import icon_incomplete from '../../assets/icons/icon_incomplete.png';

import { METHODS } from '../../config';
import { generateId } from '../../config/helpers';

import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../config';
import { UserContext } from '../../store/user-context';

import DeleteIcon from '@mui/icons-material/Delete';
import AvatarDropdown from '../UI/AvatarDropdown';

const EditSubItem = ( { item, subitem, group, ind, generateItemNotification, itemInfo, editGroupHandler} ) => {
    const UserCtx = useContext(UserContext);
    const [working, setWorking] = useState(false);
    const assignRef=useRef();
    const index = ind ? ind : 0;
    const defaultAssigneeId = item.organise ? item.organise[index].assigned : 0;
    const defaultAssignee = group.members.find(member => ( member.id === defaultAssigneeId));
    const [selectedAssigneeId, setSelectedAssigneeId] = useState(defaultAssignee?.id);
    const methodRef=useRef();
    const [method, setMethod] = useState(item.organise[index].method)
    const [methods, setMethods] = useState(METHODS)

    const [itemChecked, setItemChecked] = useState(item.organise[index].checked)

    const [alertMessage, setAlertMessage] = useState();
    const [confirmMessage, setConfirmMessage] = useState();
    //console.log(item)
 
    {/*render item name - if window is smaller then only render the number of the item otherwise show the full item name with item number*/}
    
    const itemName = (window.innerWidth <= 800 ) ? `#${ind+1}` : 
    (ind >= 0) ? `${item.name} #${ind+1}` : item.name;
 
    const user = auth.currentUser;
    
    const changeHandler = async ( field ) =>{

        // if (selectedAssigneeId === 'null') {
        //     //reset dropdown
        //     const defaultAssigneeId = item.organise ? item.organise[index].assigned : 0;
        //     const selectedAssigneeId = group.members.find(member => ( member.id === defaultAssigneeId))?.id;
        //     setSelectedAssigneeId(selectedAssigneeId);
        //     // assignRef.current.value = item.organise ? item.organise[index].assigned : 0;
        //     return;
        // }

        if (selectedAssigneeId === 'add') {
            //reset dropdown
            // const defaultAssigneeId = item.organise ? item.organise[index].assigned : 0;
            // const selectedAssigneeId = group.members.find(member => ( member.id === defaultAssigneeId))?.id;
            // setSelectedAssigneeId(selectedAssigneeId);
            // assignRef.current.value = item.organise ? item.organise[index].assigned : 0;
            //go to edit group
            editGroupHandler();
            return;
        }
    
       if (!working) {
        setMethod(methodRef.current.value);
        
        //set up notification if the current user has assigned a task to someone else 
        const assignedMember = group.members.find(member => ( member.id === selectedAssigneeId));

        if (assignedMember) {
            const assignedMemberIsCurrentUser = assignedMember.email === user.email
            //get sender - use group membership to compare emails, if email has changed use name. 
            //This is because people can change their email addresses in the group after signing up, can join the group with a new user id and still belong to the group. 
            const sender = group.members.find(member => (member.email && (member.email === user.email)));
        
            if (!assignedMemberIsCurrentUser) {
                //create or update notification object for this subitem;
                
                const method = methodRef.current.value === '0' ? 'organise' : methodRef.current.value.toLowerCase();
                
                const senderName = sender ? sender.name : UserCtx.settings.name;
                const senderEmail = sender ? sender.email : UserCtx.settings.email;
                const notificationText = `${senderName} has asked you to ${method} a ${item.name?.toLowerCase()}.`;
                
                const notification = { 
                    id: generateId(20),
                    status:'unread',
                    request:true,
                    item: item,
                    ind:ind,
                    method:methodRef.current.value, 
                    assigned: selectedAssigneeId, 
                    senderName: senderName,
                    senderEmail: senderEmail,
                    text:notificationText,
                    createdAt: Timestamp.fromDate(new Date())
                } 
                generateItemNotification(ind, notification);
            }
        }

        if (field === 'method' && methodRef.current.value === 'Hire') {
            const newActivity = {
                userid: user.uid,
                activity: 'hire',
                item: item?.name,
                festival: group?.festival?.name,
                createdAt: Timestamp.fromDate(new Date())
              };
              try {
                //add new activity to log collection
                await addDoc(collection(db, "log"), newActivity);
              } catch (err) {
                console.log(err.message);
              }
        }
        
        //add an alert if there is any buying info associated with this item. Only show this alert once.
        //if (field === 'method' && methodRef?.current?.value === 'Buy' && itemInfo && itemInfo.buying && !item.buyAlert) {
        if (field === 'method' && methodRef?.current?.value === 'Buy' && itemInfo && itemInfo.buying) {
            setAlertMessage({title:`Buying a ${item.name?.toLowerCase()}`, message: itemInfo.buying});
        }
        //add an alert if they have chosen a set festival (if there's a festival id), they have chosen to hire and the item's hiring option is on but the festival has not indicated any options to hire this item. Only show this alert once.
        //if (group?.festival?.id && field === 'method' && methodRef?.current?.value === 'Hire' && itemInfo && itemInfo.hireOption && !itemInfo.hiring && !item.hireAlert) {
        if (group?.festival?.id && field === 'method' && methodRef?.current?.value === 'Hire' && itemInfo && itemInfo.hireOption && !itemInfo.hiring) {
            const alertMsg = `Cool that you want to hire! ${group?.festival?.name} doesn't offer this yet but we're going to let them know.`;
            setAlertMessage({title:`Hiring info`, message: alertMsg});
        }
        saveItemToGroup(field);
       }
    }

    const toggleCheckHandler = () =>{
        if (!working) {
        setItemChecked(!itemChecked);
        }
     }

    const deleteHandler = async () => {
        
        //set working to prevent multiple deletes
        if (working || ind<0 ) return;
        setWorking(true);
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        const updatedItemOrganise = [...item.organise];
        updatedItemOrganise.splice( ind , 1);
        const updatedItem={
            ...group.items[itemIndex],
            organise:updatedItemOrganise,
        }
        const updatedItems = [...group.items];
        updatedItems[itemIndex] = updatedItem;
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            setAlertMessage({title:`Error`, message: `There was a problem updating your group. `+err.message});
        }
        setWorking(false);
    }
      
    const saveItemToGroup = async (field) => {
        if (working ) return;
        setWorking(true);
        
        //find which item they are editing eg tent
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        //make a shallow copy of the existing group items array
        const updatedItems = [ ...group.items ];
        const updatedSubItem = updatedItems[itemIndex].organise[index];
        //update the relevant property
        if (field === 'method') { updatedSubItem.method = methodRef.current.value === '0' ? null : methodRef.current.value; }
        if (field === 'assigned') { updatedSubItem.assigned =  selectedAssigneeId?.id; }
        updatedItems[itemIndex].organise[index] = updatedSubItem;
        //console.log(updatedSubItem)
        if ( !updatedItems[itemIndex].buyAlert && methodRef.current.value === "Buy" && field && field === 'method') {
            updatedItems[itemIndex].buyAlert = true;
        }
        if ( !updatedItems[itemIndex].hireAlert && methodRef.current.value === "Hire" && field && field === 'method') {
            updatedItems[itemIndex].hireAlert = true;
        }
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            setAlertMessage({title:`Error`, message: `There was a problem updating your group. `+err.message});
        }

        //update user details to say they are an active organiser
        if (UserCtx.settings.activeOrganiser === false) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { 
                    activeOrganiser: true
                });
            } catch (err) {
                setAlertMessage({title:`Error`, message: `There was a problem updating the user. `+err.message});
            }
        }
        
        setWorking(false);
        
    }

    const saveItemCheckToGroup = async () => {
        if (working ) return;
        setWorking(true);   
        //find which item they are editing eg tent
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        //make a shallow copy of the existing group items array
        const updatedItems = [ ...group.items ];
        const updatedSubItem = updatedItems[itemIndex].organise[index];
        //update the checked property
        updatedSubItem.checked = itemChecked ? itemChecked : false;
        updatedSubItem.method = methodRef.current.value === '0' ? null : methodRef.current.value; 
        updatedSubItem.assigned =   selectedAssigneeId?.id; 
        updatedItems[itemIndex].organise[index] = updatedSubItem;
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            setAlertMessage({title:`Error`, message: `There was a problem updating the checked item. `+err.message});
        }
        //update user details to say they are an active organiser
        if (UserCtx.settings.activeOrganiser === false) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { 
                    activeOrganiser: true
                });
            } catch (err) {
                setAlertMessage({title:`Error`, message: `There was a problem updating the user. `+err.message});
            }
        }
        setWorking(false);
    }

    useEffect(() => {
        if (!itemInfo) return;
        //item Info has changed - update methods. If the item has hiring info toggle switched on then show option to hire
        const availableMethods = itemInfo.hireOption ? METHODS : METHODS.filter( (method) => method.id !== 'Hire');
        setMethods(availableMethods);
      }, [itemInfo]);

      useEffect(() => {
        //console.log('item checked?',itemChecked);
        // saveItemCheckToGroup();
      }, [itemChecked]);

     

    return (
       
       <form className= {classes.editItemForm} >
                  
                <Button 
                    className='noStyle'
                    onClick={toggleCheckHandler}
                    >

                    { itemChecked ? 
                        <img src={icon_complete}  alt='checked'  className={classes.editItemProgressIcon} /> : 
                        <img src={icon_incomplete}  alt='unchecked'  className={classes.editItemProgressIcon} />
                    }

                </Button>

                <div className={classes.editItemName}>
                    {itemName}
                </div>

                <div className={classes.editItemEqual}>
                    =
                </div>

                <select 
                    // ref={assignRef}
                    id='assigned' 
                    className={`${classes.formInput} ${classes.editItemAssign}`} 
                    setSelectedAssignee={(memberId) =>  {
                        // setSelectedAssigneeId(memberId); 
                        // saveItemCheckToGroup(); 
                        // changeHandler('assigned');
                    }}
                    defaultValue = {item.organise ? item.organise[index].assigned : 0 } 
                    // options ={ group.members.map(m => ({ text: m.name, member: m, value: m.name })) }
                    >

                    { group.members.map( (member, i ) => (

                        <option key={i} 
                        value={member.id}>
                            {member.name}
                        </option>

                    ))}

                    <option key={'null1'} value={'null'}> ---- </option>
                    <option key={'unassigned'} value={'unassigned'}>Unassigned</option>
                    <option key={'null2'} value={'null'}> ---- </option>
                    <option key={'add'} value={'add'}>Add someone</option>

                </select>

                <select 
                    id='method' 
                    className={`
                    ${classes.formInput} ${classes.editItemMethod} 
                    ${(!method || method==='0' ) && classes.editItemSelectPlaceholder}
                    `} 
                    ref={methodRef} 
                    onChange={()=>changeHandler('method')}
                    defaultValue = {item.organise ? item.organise[index].method : 0 } 
                    >

                    <option key={0} value={0}> How? </option>

                    { methods.map( (method, i ) => (

                        <option key={i} 
                        value={method.id}>
                            { method.title }
                        </option>

                    ))}

                </select>

                 <Button 
                    className='noStyle' 
                    onClick={
                        index > 0 ? 
                        deleteHandler
                        :
                        () => setConfirmMessage({title:`Are you sure?`, message: `This action will remove any ${item.name?.toLowerCase()}s and take you back to the list.`})
                    }>
                    <div className={classes.editItemDelete}>
                        <DeleteIcon style={{ fontSize: 30}}/>
                    </div>
                </Button> 

                {alertMessage && 
                    <Alert 
                    title={alertMessage.title}
                    message={alertMessage.message}
                    onConfirm={()=>setAlertMessage()}
                    />
                }

                {confirmMessage && 
                    <Alert 
                    title={confirmMessage.title}
                    message={confirmMessage.message}
                    onCancel={()=>setConfirmMessage()}
                    onConfirm={()=>{ deleteHandler(); setConfirmMessage(); }}
                    />
                }
                

                </form>

    );

}

export default EditSubItem;