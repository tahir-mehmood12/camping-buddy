import React, { useRef, useContext  } from 'react';

import { auth, db } from '../../config';
import {  doc, updateDoc  } from 'firebase/firestore';
import { UserContext } from '../../store/user-context';
import classes from './Forms.module.css';

const EditItemNotes = ( { item, group } ) => {

    const UserCtx = useContext(UserContext);
    
    const notesRef=useRef();
   
    const user = auth.currentUser;

    const handleNotesChange = async () => {
        
        //find which item they are editing eg tent
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        
        //make a copy of the existing group items array
        const updatedItems = [ ...group.items ];
        
        //update the item notes
        updatedItems[itemIndex].notes = notesRef.current.value;

        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            alert("There was a problem updating your group.")
        }

        //update user details to say they are an active organiser
        if (UserCtx.settings.activeOrganiser === false) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { 
                    activeOrganiser: true
                });
            } catch (err) {
                alert("There was a problem updating the user.")
            }
        }
        
    }

    return (
       
        <textarea 
            ref={notesRef} 
            onBlur={handleNotesChange}
            defaultValue={item?.notes}
            placeholder="Notes/Comments" 
            className={classes.editItemNotes}>
            
        </textarea>


    );

}

export default EditItemNotes;