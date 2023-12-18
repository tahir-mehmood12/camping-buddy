import React, { useState} from 'react';
import classes from './Acknowledgement.module.css';

import Loading from '../UI/Loading';
import Button from '../UI/Button';
import TopMenuOnboarding from '../Navigation/TopMenuOnboarding';

import { signOut } from 'firebase/auth';
import { auth} from '../../config';


import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';

const Acknowledgement = ({ group }) => {

  const [working, setWorking] = useState(false);

  {/*The previous screen is the log in screen so if we need to log them out to go back*/}

  const goBack = async () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  }

  {/*Add acknowledgement to the user's group in the database*/}
  
  const saveAcknowledgementToGroup = async () => {
    if (group && group.id) {
      try {
        setWorking(true);
        const groupRef = doc(db, 'groups', group.id);
        await updateDoc(groupRef, { 
          acknowledgement: true
        });
      } catch (err) {
        alert("There was a problem updating your group.")
      }
      setWorking(false);
    }
  }

  if (working) return (
    <Loading msg='Loading'/>
  )
    
    return (

      <div className='container bg'>
  
        <TopMenuOnboarding title='Acknowledgement of Country' group={group} backHandler={goBack}/>
  
        <div className={classes.content}>

            {/*<div className={classes.img}>
                <div className='headerImage'><img src={wombat} alt='Wombat' /></div>
            </div>

            <Heading></Heading>*/}

            <div className={classes.contentText}>

                <p>We thank the traditional custodians for their continued care of the land on which we walk. </p>
                <p>We researched and created this app on country, with the intention of following in their footsteps to ensure this land thrives alongside us. </p>
                <p>We also thank you, <strong>YES YOU!</strong></p>
                <p>Thank you for using this app to create a greener and cleaner world. These lands nurture us and ought to be protected for generations to come. </p>
                <p>Bring your mates along for this journey, keep dreaming, and have fun partying with the planet!</p>

       

            </div>
  
       
        </div>
  
        <div className={classes.footer}>
  
          <div className={classes.footerContent}>
  
          <Button 
                className='primary'
                onClick={saveAcknowledgementToGroup}
                >
                OK
            </Button>
  
          </div>
  
        </div>
  
        </div>

       
     
    );
  };
  
  export default Acknowledgement;