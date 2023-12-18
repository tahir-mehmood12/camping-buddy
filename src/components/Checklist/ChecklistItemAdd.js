import React, { useState } from 'react';
import classes from './ChecklistItemAdd.module.css';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '../UI/Button';

import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';
import Alert from '../Modals/Alert';

const ChecklistItemAdd = ( { direction, numberItems, group, item, filterMembers } ) => {

    const user = auth.currentUser;
    const [alertMessage, setAlertMessage] = useState();

    const [working, setWorking] = useState(false);

    const changeNumberOfItems = async () => {
        setWorking(true);
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        const updatedItemOrganise = item.organise ? [...item.organise] : [];
        //who should it be assigned to? If there is one person in the filter add them, otherwise make it unassigned
        const assignee = filterMembers?.length == 1 ? filterMembers[0] : 'unassigned';
        const defaultItemOrganiseObj = { assigned: assignee, checked: false }
        if (direction === 'up') {
            updatedItemOrganise.push(defaultItemOrganiseObj)
        } else {
            updatedItemOrganise.splice( (updatedItemOrganise.length-1) , 1);
        }
        const updatedItem={
            ...group.items[itemIndex],
            organise:updatedItemOrganise
        }
        const updatedItems = [...group.items];
        updatedItems[itemIndex] = updatedItem;
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            alert("There was a problem updating your group.")
        }
        setWorking(false);
    }
   

    const addHandler = ( ) => {
        if (working) return;
        if (direction ==='up') {
            changeNumberOfItems()
        } else {
            if (numberItems > 1) {
                changeNumberOfItems();
            } else if (numberItems === 1) {
                setAlertMessage({title:`Alert`, message: 'Are you sure you want to remove this item from your list?'});
            }
        }
    }
    

    const renderIcon = () => {

        return (
            direction === 'up' ? 
            <AddIcon 
                className={classes.numberAdd}
                style={{ fontSize: 25}}
                />
            :
            <RemoveIcon
                className={numberItems>0 ? classes.numberRemove : classes.hidden}
                style={{ fontSize: 25}}
                />
        )

    }

   

    return (

        <>

        <Button 
            onClick={addHandler}
            className='noStyle'
            >
            {renderIcon()}
        </Button>

        {alertMessage && 
            <Alert 
            title={alertMessage.title}
            message={alertMessage.message}
            onConfirm={()=>{changeNumberOfItems(); setAlertMessage();}}
            onCancel={()=>setAlertMessage()}
            />
        }
        
        </>


    );

}

export default ChecklistItemAdd;