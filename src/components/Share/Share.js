import React, { useState, useEffect } from 'react';
import classes from './Share.module.css';
import icon_share from '../../assets/icons/icon_share.png';
import Modal from "../Modals/Modal";
import Alert from '../Modals/Alert';
import Button from '../UI/Button';
import { db, auth } from '../../config';

import { collection, addDoc, Timestamp } from 'firebase/firestore';

const Share = ( { group } ) => {

    const [showShare, setShowShare] = useState(false);
    const user = auth.currentUser;

    const [alertMessage, setAlertMessage] = useState();
    
    const handleShare = async () => {
        setShowShare(!showShare);
        setAlertMessage();
    };

    const logActivity = async () => {
      const newActivity = {
        userid: user.uid,
        activity: 'share',
        festival: group?.festival?.name,
        createdAt: Timestamp.fromDate(new Date())
      };
      try {
        //add new user to log collection
        await addDoc(collection(db, "log"), newActivity);
      } catch (err) {
        console.log(err.message);
      }
    }


    const fallbackCopyTextToClipboard = (text) => {
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
            setAlertMessage({ title:"Share link created!", message: "A link has been copied to the clipboard. You can paste this into a message to share this list with people."});
          } else {
            setAlertMessage({ title:"Oops", message: "We had some trouble creating a link."});
          }
        } catch (err) {
            setAlertMessage({ title:"Oops", message: "We had some trouble creating a link."});
        }
        document.body.removeChild(textArea);
      }

    const createShareLink = () => {
        // Link is something like https://camping-buddy-site.web.app/share/group?id=8Rb4u6xftU8mvxt3hSgx
        const shareLink = `https://camping-buddy-site.web.app/share/group?id=${group.id}`
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(shareLink);
            return;
          }
          navigator.clipboard.writeText(shareLink).then(function() {
            setAlertMessage({ title:"Share link created!", message: "A link has been copied to the clipboard. You can paste this into a message to share this list with people."});
          }, function(err) {
            setAlertMessage({ title:"Oops", message: "We had some trouble creating a link. Error: "+err});
          });
          logActivity();
    }


    if (!group) return;

    const renderModal = () => {
        
        return (
            <Modal 
            align='top' 
            back 
            title='Share'
            onConfirm={handleShare}
            onCancel={()=>setShowShare(!showShare)}
            >

            {/*MODAL LEFT HERE IN CASE WE WANT TO ADD SHARE SETTINGS*/}
        
        </Modal>
        )
    }

    if (!user.isAnonymous) return (

        <div className={classes.shareContainer}>

          <Button className='noStyle' onClick={createShareLink}>
            <div className='actionButton'>
                <img src={icon_share}  alt='Share'  className={classes.icon_share} />
            </div>
          </Button>

          {/*showShare && renderModal()*/}

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

export default Share;