import React, { useContext, useState } from 'react';
import classes from './ChecklistAdd.module.css';

import AddIcon from '@mui/icons-material/Add';
import Button from '../UI/Button';
import { UserContext } from '../../store/user-context';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';



const ChecklistAddOrganise = ( { label, item, group, style } ) => {
    //adds element from organise - if they are adding another tent from the tent organise screen for example

    const [working, setWorking] = useState(false);
    const user = auth.currentUser;

    //get sort mode from user context
    const UserCtx = useContext(UserContext);
    const sortMode = UserCtx?.sortMode; //members or categories
    
    const addHandler = async () => {
        
        if (working) return;

        setWorking(true);

        if (item && group) {
            //add one to the selected item (coming from Organise screen)
            const itemIndex = group.items.findIndex(i => i.id === item.id);
            const updatedItemOrganise = [...item.organise];
            const defaultItemOrganiseObj = { assigned: user.uid, checked: false }
            updatedItemOrganise.push(defaultItemOrganiseObj)
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

        } 
        
        setWorking(false);
    }

    return (

        <div className={classes.checklistAddGroup} style={style}>
            { label && 
                <Button 
                className='addButtonLabel'
                onClick={addHandler}
                >
                    {label}
                </Button>
            }           
        <Button 
            className='addButtonIcon'
            onClick={addHandler}
            >
            <AddIcon style={{fontSize: 20}}/>
        </Button>
        </div>

    );

}

export default ChecklistAddOrganise;