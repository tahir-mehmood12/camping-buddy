import React, {useEffect, useState, useMemo} from 'react';

import classes from './World.module.css';

import world1 from '../../assets/earth/world1.png';
import world2 from '../../assets/earth/world2.png';
import world3 from '../../assets/earth/world3.png';
import world4 from '../../assets/earth/world4.png';
import world5 from '../../assets/earth/world5.png';

import Alert from '../Modals/Alert';
import Button from '../UI/Button';
import { auth, db } from '../../config';

import { collection, addDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';

const World = ({ group, festivalName }) => {
  
  const items = group?.items;

  const [showTip, setShowTip]=useState(false);
  
  const showTipHandler= ()=>{
    setShowTip(!showTip);
  };

  const user = auth.currentUser;

  let totalAssigned= 0; //total number of items that has a method (e.g. buy or hire)
  let combinedScore=0;//combined score of all items
  const buyScore = 1; //score low if they have chosen to buy
  const otherScore = 5; //score high if they have chosen another method

  //loop through group's items
  items?.forEach((item, i) => {

    const organise = item.organise; //get the organisation object for each item

     //loop through methods (e.g. buy, borrow etc)
    organise?.forEach((org, i) => {
      //if a method has been set and the item is set to impact earth score then continue
      if (org.method && item.impact) {
        // increment the count of assigned methods
        totalAssigned++; 
        if (org.method === 'Buy') {
          //penalise them for buying a high impact item
          combinedScore=combinedScore+buyScore;
        } else {
          combinedScore=combinedScore+otherScore;
        } 
      }
    });
  });

  //console.log('totalAssigned',totalAssigned);
  //console.log('combinedScore',combinedScore);

  const updateGroupScore = async () => {
    try {
      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
          score: worldScore
        });
        console.log('group score updated to:', worldScore);
    } catch (err) {
      console.log(err);
    }
  }

  //get the average score of all assigned items
  let averageScore=0; if (totalAssigned>0){averageScore=combinedScore/totalAssigned;}
  //console.log('averageScore',averageScore);
  const percentageScore=(averageScore/5)*100;//out of 5 maximum item ecoscore
  //console.log('percentageScore',percentageScore);
  let worldScore=Math.round(percentageScore/20);
  if (worldScore !== group.score) { updateGroupScore(); }

  

  //World levels between 1-5. If world is 0 that means nothing has been selected and we set world to be 5 (best)

  const logActivity = async() => {
    const newActivity = {
         userid: user.uid,
         activity: 'earth score',
         score: worldScore,
         festival: festivalName,
         createdAt: Timestamp.fromDate(new Date())
       };
       try {
         //add new activity to log collection
         await addDoc(collection(db, "log"), newActivity);
       } catch (err) {
         console.log(err.message);
       }
   }

  let world;
  switch(worldScore){
    case 1: world=world1; break;
    case 2: world=world2; break;
    case 3: world=world3; break;
    case 4: world=world4; break;
    default: world = world5; //default is healthy world (5)
  }


  const getTipContent = () => {
    let content;
    switch(worldScore){
      case 0: content=`You can keep it healthy by borrowing, hiring or re-using the gear you’re taking to ${festivalName}`; break;
      case 1: content="Make it greener by borrowing, hiring, or re-using more of your gear."; break;
      case 2: content="Make it greener by borrowing, hiring, or re-using more of your gear.";break;
      case 3: content="Make it greener by borrowing, hiring, or re-using more of your gear."; break;
      case 4: content="Make it greener by borrowing, hiring, or re-using more of your gear."; break;
      case 5: content="Keep up the good work."; break;
      default: content="";
    }
    return content;
  }
  const getTipTitle = () => {
    let title;
    switch(worldScore){
      case 0: title="Camping Buddy tracks the health of your planet."; break;
      case 1: title="Your Earth is on fire and not in a good way! "; break;
      case 2: title="Your Earth needs some love.";break;
      case 3: title="Your Earth is ok but it could be amazing."; break;
      case 4: title="Your Earth is close to perfect. "; break;
      case 5: title="Your Earth is looking great!"; break;
      default: title="";
    }
    return title;
  }

  useEffect(() => {
    if (!showTip) return;
    logActivity();
  }, [showTip]);

  if (showTip) return (
    <Alert 
        title={getTipTitle()}
        message={getTipContent()}
        onConfirm={showTipHandler}
    />
  )

  return(



      <img 
      src={world} 
      className={classes.worldImg}
      alt="Healthy Earth" 
      onClick={showTipHandler}
      />


  )
}

export default World;
