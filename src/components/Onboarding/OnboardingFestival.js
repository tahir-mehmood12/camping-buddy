import React, { useState, useEffect, useContext } from 'react';
import classes from './OnboardingFestival.module.css';

import EditFestival from '../Forms/EditFestival';
import FestivalTile from './FestivalTile';
import Loading from '../UI/Loading';

import TopMenuOnboarding from '../Navigation/TopMenuOnboarding';
import { UserContext } from '../../store/user-context';

import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';

const OnboardingFestival = ({ group }) => {

  {/*Called from Root. Shows options to select a festival if the user has just signed up or created a group and the group's festival is not specified. */}

  const [working, setWorking] = useState(false);
  const user = auth.currentUser;
  const [festivals, setFestivals] = useState([]);
  const [festival, setFestival] = useState (group?.festival);
  const UserCtx = useContext(UserContext);
  const groups = UserCtx.groups;

  //back navigation on this screen goes to acknowledgement of country, which is where they should go if they are creating a group for the first time (onboarding)
  //however we also come to this screen when creating a new group from the settings screen - really it should be a different component, not this onboarding component
  //quick fix - only allow back navigation if this is their first group
  const allowBackNavigation = groups?.length>1 ? false : true;


  {/*The previous screen is the acknowledgements so if we need to remove acknowldegement from the group to go back*/}

  const goBack = async () => {
    try {
      setWorking(true);
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, { 
        acknowledgement: false
      });
    } catch (err) {
      alert("There was a problem updating your group.")
    }
    setWorking(false);
  }

  {/*Add the selected festival to the user's group in the database*/}

  const saveFestivalToGroup = async () => {
    if (group && group.id) {
      try {
        setWorking(true);
        const groupRef = doc(db, 'groups', group.id);
        await updateDoc(groupRef, { 
          festival: festival
        });
      } catch (err) {
        alert("There was a problem updating your group.")
      }
      setWorking(false);
    }
  }

  useEffect(() => {
    if (!festival) return;
    saveFestivalToGroup();
  }, [festival]);

  useEffect(() => {
    //set up listener for festivals
    if (!user) return;
    setFestivals([]);
    const q = query(collection(db, 'festivals'), where("active", "==", true));
    const unsubscribe = onSnapshot(q,
    (querySnapshot) => {
      const festivalsSnapshot = [];
      querySnapshot.forEach((doc) => {
        //remove default items from festivals (this will be added in next onboarding screen)
        const dataObj = {...doc.data()}
        delete dataObj.items;
        festivalsSnapshot.push(dataObj);
      });
      setFestivals(festivalsSnapshot);
    },
    (error) => {
      console.log(error.message);
    });

    return () => {
      unsubscribe();
      setFestivals();
    };
  }, [user])

  if (working) return <Loading msg='Loading'/>
    
    return (


      <div className='container bg'>

        <TopMenuOnboarding 
        title='Where are you going?' 
        group={group} 
        backHandler={ allowBackNavigation ? goBack : false}
        />

        <div className={classes.content}>

          <div className={classes.contentText}>

                {/*Add custom festival*/}

                <EditFestival 
                  groupId={group?.id}
                  festival={festival} 
                  pressHandler={setFestival}
                  />

                  {/*Map list of active festivals from database*/}

                  <div className={classes.festivalsContainer}>

                  {festivals?.map(festival =>

                    <FestivalTile 
                    key={festival.id} 
                    festival={festival}
                    pressHandler={setFestival}
                    />

                  )}

                  </div>

            </div>

        </div>

      </div>


    );
  };
  
  export default OnboardingFestival;