import React, { useState, useContext, useEffect } from 'react';

import { getFirestore, collection, query, orderBy, where, onSnapshot, doc, getDoc, getDocs, deleteDoc,addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, CATEGORIES } from '../config';
import { signOut, sendPasswordResetEmail  } from 'firebase/auth';

import Acknowledgement from '../components/Onboarding/Acknowledgement';
import OnboardingFestival from '../components/Onboarding/OnboardingFestival';
import OnboardingItems from '../components/Onboarding/OnboardingItems';
import Loading from '../components/UI/Loading';
import Home from '../components/Home/Home';
import Checklist from '../components/Checklist/Checklist';
import Notifications from '../components/Notifications/Notifications';
import Settings from '../components/Settings/Settings';
import BottomTabs from '../components/Navigation/BottomTabs';
import TopMenu from '../components/Navigation/TopMenu';

import { UserContext } from '../store/user-context';

const Root = props => {

  const [groups, setGroups] = useState();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [group, setGroup] = useState();
  const [working, setWorking] = useState(false);
  const [settings, setSettings] = useState();
  const [festival, setFestival] = useState();
   
  
  const UserCtx = useContext(UserContext);
  //console.log(UserCtx.itemInfo)
 
  const user = auth.currentUser;

 //console.log(user.email)

  const addNewGroup = async (user, userName) => {
    //called when user creates a new group / event from settings screen
     const newGroup = {
      acknowledgement:true,
      id: '123',
      owner: user.uid,
      memberIds: [user.uid], //member ids only for queries later on
      memberEmails: [user.email], //member emails only for queries later on
      categories: CATEGORIES,
      members: [
        {
          id: user.uid,
          email:user.email, 
          name:userName, 
          avatar: 1,
          editor: true,
          owner: true
        }
      ], //set up membership for group
      createdAt: Timestamp.fromDate(new Date())
    }
    //add new group to group collection
    try {
      const newGroupRef = await addDoc(collection(db, 'groups'), newGroup);
      //add the auto generated id to the created group
      if (newGroupRef && newGroupRef.id) {
        const groupRef = doc(db, 'groups', newGroupRef.id);
        await updateDoc(groupRef, { id: newGroupRef.id});
        newGroup.id=newGroupRef.id;
        setGroup(newGroup);
        UserCtx.setCurrent(newGroupRef.id);
      }
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
}

  useEffect(() => {
    //set up listener for groups
    //Firestore database query snapshot https://firebase.google.com/docs/firestore/query-data/listen
    if (!user) return;
    setGroups();
    UserCtx.setGroups()
    //console.log('Listening for groups for',user.uid);
    //A maximum of 1 'ARRAY_CONTAINS' filter is allowed per disjunction.
    const q = (user.isAnonymous) ? 
      query(
        collection(db, 'groups'), 
        where("memberIds", "array-contains", user.uid),
        ) : 
      query(
        collection(db, 'groups'), 
        where("memberEmails", "array-contains", user.email),
        );
    const unsubscribe1 = onSnapshot(q,
    (querySnapshot) => {
      const groupsSnapshot = [];
      querySnapshot.forEach((doc) => {
      groupsSnapshot.push(doc.data());
      });
      setGroups(groupsSnapshot);
      UserCtx.setGroups(groupsSnapshot)
    },
    (error) => {
      console.log(error.message);
    });
    //set up listener for user settings
    //console.log('Listening for user settings for',user.uid);
    const unsubscribe2 = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.data()) {
          setSettings(doc.data());
          UserCtx.setSettings(doc.data())
        }
    });
    return () => {
      //console.log('Detaching the database listeners for',user.uid);
      unsubscribe1();
      unsubscribe2();
      setGroups();
      setSettings();
    };
  }, [user])

  useEffect(() => {
    if (!groups) return;
    if (groups.length > 0) {
      //load last loaded event (if they belong to more than one event group)
      const currentGroup = 
      (UserCtx.current) ? 
        //has previously logged in therefore current group has been set
        groups.find( group => group.id === UserCtx.current)  ?? groups[0]
      :
        //set current group to the first group they belong to
        groups[0]
        ;
      //console.log('groups have loaded, set current group to',UserCtx.current,currentGroup?.id);
      if (currentGroup) UserCtx.setCurrent(currentGroup.id);
      setGroup(currentGroup);
    } else {
      setGroup()
    }
  }, [groups])

  useEffect(() => {
    if (UserCtx.current && groups && (UserCtx.current ==='new') ) {
      //add a new group
      addNewGroup(user,UserCtx.settings?.name);
    } else if (UserCtx.current && groups && (UserCtx.current !== group?.id) && (UserCtx.current !== 'delete') ) {
      //new group has been selected - switch to new group
      console.log('new group has been selected - switch to new group ',UserCtx.current);
      const currentGroup = groups.find( group => group.id === UserCtx.current);
      setGroup(currentGroup);
    } else if (UserCtx.current && groups && (UserCtx.current ==='delete') ) {
      if (groups.length > 0) {
        //switch to their next group
        console.log('current group has been deleted, switch to the next group',groups[0].id);
        UserCtx.setCurrent(groups[0].id);
      } else {
        //they've deleted their only group - add a new one
        console.log('current group has been deleted, no other groups available, add a new group');
        addNewGroup(user,UserCtx.settings?.name);
      }
    } 
  }, [UserCtx.current])
  

  useEffect(() => {
    //UserCtx.setCurrent(); signOut(auth).catch(error => console.log('Error logging out: ', error));
    //group has changed
    setFestival();
    if (!group) return;
    if (!group.festival) return;
    let unsubscribe3;
    if (group.festival.id) {
      //set up listener for festival info
      unsubscribe3 = onSnapshot(doc(db, 'festivals', group.festival.id), (doc) => {
        if (doc.data()) {
          setFestival(doc.data());
          UserCtx.setFestival(doc.data())
        }
      });
      //clear defaultitem list from user context - using festival specific items not item info from master packing list
      UserCtx.setItemInfo()
    } else {
      
      //they have created a custom event - set up listener for default items / master packing list
      const q = query(collection(db, "defaultitems"));
      unsubscribe3 = onSnapshot(q, (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => { items.push(doc.data()); });
        UserCtx.setItemInfo(items)
      });
    }
  }, [group]);

  if (!group) return ( <Loading msg='Loading' />)

  if (!group.acknowledgement) return ( <Acknowledgement group={group}/>)
  
  if (!group.festival) return ( <OnboardingFestival group={group}/>)
  
  if (!group.items) return ( <OnboardingItems group={group}/>)

    return (
      <div className='container bg'>

      <TopMenu currentScreen={currentScreen} group={group}/>

      <div className='content'>

      { currentScreen === "home" && 
        <Home 
          group={group} 
          festival={group?.festival} 
          festivalInfo = {festival}
          setCurrentScreen = {setCurrentScreen}
          /> 
      }
      
      { currentScreen === "list" && 
        <Checklist 
        group={group}
        /> 
      }
      { currentScreen === "notifications" && <Notifications settings={settings} group={group}/> }
      { currentScreen === "settings" && <Settings group={group} settings={settings}/> }

      </div>

      <BottomTabs
        currentScreen={currentScreen}
        setCurrentScreen ={setCurrentScreen}
        />

    </div>
    );

}

export default Root;