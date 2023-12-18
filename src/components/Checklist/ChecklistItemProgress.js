import React, { useState, useEffect } from 'react';
import classes from './ChecklistItemProgress.module.css';

import Button from '../UI/Button';

import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';

import icon_complete from '../../assets/icons/icon_complete.png';
import icon_incomplete from '../../assets/icons/icon_incomplete.png';
import icon_inprogress from '../../assets/icons/icon_inprogress.png';


const ChecklistItemProgress = ( { group, item } ) => {

    const user = auth.currentUser;

    const [working, setWorking] = useState(false);
    
    const [itemProgress, setItemProgress] = useState()
    //console.log(item.name, item, itemProgress);

    const toggleItemComplete = () => {
        if (working) return;
        if (itemProgress === 'complete') {
            setItemProgress('incomplete'); 
            saveItemToGroup(false);
        } else {
            setItemProgress('complete');
            saveItemToGroup(true);
        }
    }

    const saveItemToGroup = async (checked) => {
        setWorking(true);
        
        //find which item they are editing eg tent
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        
        //make a copy of the existing group items array
        const updatedItems = [ ...group.items ];

        //make a copy of the existing item and set the checked state of every organise object
        //checking the item's checkbox turns on or off every subitem organise check box
        updatedItems[itemIndex].organise.map ( org => ( org.checked = checked ));
        
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

    useEffect(() => {
        if (!item) return;
        //check whether any subitem e.g. the 2nd tent has been checked
        const checkedSubitems = item.organise.filter( subitem => subitem.checked);
        const uncheckedSubitems = item.organise.filter( subitem => !subitem.checked);
        //default progress is incomplete
        let progress = 'incomplete';
        //if all subitems have been checked then set item progress to complete
        if (checkedSubitems.length === item.organise.length) {
            progress='complete';
        } else if (uncheckedSubitems.length !== item.organise.length) {
            //if only some items have been checked then set item progress to in progress
            progress='inprogress';
        }
        setItemProgress(progress)
       
    }, [item]);
   
   

    return (

        <Button 
        className='noStyle'
        onClick={toggleItemComplete}
        >

        { itemProgress === 'complete' ? 
            <img src={icon_complete}  alt='checked' className={classes.progressImageIcon} /> : 
            itemProgress === 'inprogress' ?
            <img src={icon_inprogress}  alt='in progress' className={classes.progressImageIcon} /> :
            <img src={icon_incomplete}  alt='unchecked' className={classes.progressImageIcon} />
        }

        {/*<img src={icon_progress_none}  alt=''  className={classes.editItemProgressIcon} />*/}

    </Button>

    );

}

export default ChecklistItemProgress;