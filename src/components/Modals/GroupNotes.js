import React, { useState, useRef } from 'react';
import icon_notepad from '../../assets/icons/icon_notepad.png';
import DescriptionIcon from '@mui/icons-material/Description';
import classes from './GroupNotes.module.css';
import Modal from "../Modals/Modal";
import Button from '../UI/Button';
import { db } from '../../config';
import {  doc, updateDoc  } from 'firebase/firestore';

const GroupNotes = ( { group } ) => {

    const [showNotes, setShowNotes] = useState(false);
    const groupNotesRef=useRef();

    const handleNotesChange = async () => {
        const groupNotes=groupNotesRef.current.value;
        if (!groupNotes){ return;} else {
            //update group notes record in db
            try {
                const groupRef = doc(db, "groups", group.id);
                await updateDoc(groupRef, {
                    notes:groupNotes
                  });
              } catch (err) {
                console.log(err);
              }
        }
    };

    if (!group) return (  <></> )

    const renderModal = () => {
        
        return (
            <Modal 
            align='top' 
            back 
            hideHeader={true}
            title={group.name ? group.name : 'Notes'}
            onConfirm={()=>setShowNotes(!showNotes)}
            onCancel={()=>setShowNotes(!showNotes)}
            style={{}}
            bgstyle={{'background':'#FFFFFF'}}
            >

            <div className={classes.notePad}>

                <div className={classes.notePadHeader}>Notes</div>

               <textarea 
                ref={groupNotesRef} 
                onBlur={handleNotesChange}
                defaultValue={group?.notes}
                placeholder="Add notes" 
                className={classes.notes}>
               
               </textarea>

            </div>
        
        </Modal>
        )
    }

    
    return (

        <div className={classes.notesContainer}>

          <Button className='noStyle' onClick={()=>setShowNotes(!showNotes)}>
            <div className='actionButton'>
                <DescriptionIcon  style={{ fontSize: 30 }}/>
            </div>
            {/*<img src={icon_notepad}  alt=''  className={classes.notepad_icon} />*/}
          </Button>

          {showNotes && renderModal()}

      </div>


        


    );

}

export default GroupNotes;