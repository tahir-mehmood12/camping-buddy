import React, { useState, useEffect } from 'react';
import classes from './OnboardingItems.module.css';

import { Checkbox } from 'semantic-ui-react';

import Loading from '../UI/Loading';
import Button from '../UI/Button';
import CategorySection from './CategorySection';
import TopMenuOnboarding from '../Navigation/TopMenuOnboarding';

import { collection, getDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';

const OnboardingItems = ({ group }) => {

  {/*Called from Root. Shows options to select items if the user has just signed up or created a group and the group's items are not specified. */}

  const [working, setWorking] = useState(false);
  const user = auth.currentUser;
  const [items, setItems] = useState([]);
  const [promptText, setPromptText] = useState();
  const instructionsText = "Tap any item to deselect it. You can add things later on.";
  const [defaultAssignee, setDefaultAssignee] = useState(user.uid);


  const toggleAssignee = () => {
    if (defaultAssignee === user.uid) {
      setDefaultAssignee('unassigned');
    } else {
      setDefaultAssignee(user.uid);
    }
  }

  const updateItem = ( id, selected ) =>{
    if ( !items || !id ) return;
    const itemIndex = items.findIndex(item => item.id === id);
    const updatedItem={
      ...items[itemIndex],
      selected:selected
    }
    const updatedItems = [...items];
    updatedItems[itemIndex] = updatedItem;
    setItems(updatedItems)
  }

   {/*The previous screen is selecting a festival so if we need to remove festival from the group to go back*/}

   const goBack = async () => {
    try {
      setWorking(true);
      const groupRef = doc(db, 'groups', group.id);
      await updateDoc(groupRef, { 
        festival: null
      });
    } catch (err) {
      alert("There was a problem updating your group.")
    }
    setWorking(false);
  }

  {/*Add the selected items to the user's group in the database*/}

  const saveItemsToGroup = async () => {
    if (group && group.id) {
      //get which ones they have left 'on'
      const selectedItems = items.filter( item => item.selected)
      //update selected items with the default assignee
      const assignedItems = [ ...selectedItems ];
      assignedItems.forEach(item => {
          item.organise.map(org => {
              org.assigned = defaultAssignee
          });
      });
      
      try {
        setWorking(true);
        const groupRef = doc(db, 'groups', group.id);
        await updateDoc(groupRef, { 
          items: assignedItems
        });
      } catch (err) {
        alert("There was a problem updating your group.")
      }
      setWorking(false);
    }
  }

  const getFestivalItems = async ( id ) => {
    const docRef = doc(db, "festivals", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        //the selected key is how the user curates the list - set it true as default. Also set the default assignment for each item  
        const festivalItems = docSnap.data().items.map((item,index) => (
          {...item, selected: true, organise: [{ assigned: defaultAssignee, checked: false }], order: index}
          ))
        setItems(festivalItems);
      } 
  }

  const getDefaultItems = async (  ) => {
    const itemsArray = [];
    const querySnapshot = await getDocs(collection(db, "defaultitems"));
    querySnapshot.forEach((doc) => {
        itemsArray.push(doc.data());
    });

    //the selected key is how the user curates the list - set it true as default. Also set the default assignment for each item 
    const defaultItems = itemsArray.map((item,index) => (
      {...item, selected: true, organise: [{ assigned: defaultAssignee, checked: false }], order: index}
      ))
    setItems(defaultItems);
  }

  useEffect(() => {
    if (!items) return;
    //saveItemsToGroup();
  }, [items]);

  useEffect(() => {
    if (!group) return;
    setItems([]);
    //if they have chosen a festival in the previous onboarding screen
    if (group.festival.id){
        //set up festival-specific items as default
        setPromptText( `${group.festival.name} suggests you take these things.` );
        getFestivalItems(group.festival.id); 
    } else {
        //they have added their own event - set up default items as default
        setPromptText( `We suggest you take these things to ${group.festival.name}.` );
        getDefaultItems();
    }
  }, [group])

  const renderCategories = () => {
    if (!group) return;
    return (
        group.categories.map( (category, index ) => (
          <CategorySection 
            key={index}
            category={category}
            items={items}
            updateItem={updateItem}
            />
        ))
    )
    }

  if (working) return <Loading msg='Loading'/>
    
    return (
      <div className='container bg'>

        <TopMenuOnboarding title='Create your list' group={group} backHandler={goBack}/>

        <div className={classes.content}>

          <div className={classes.contentText}>

          <p>{promptText} {instructionsText}</p>

          <div className="pledgeCheckbox">
            <Checkbox 
            defaultChecked={defaultAssignee === user.uid} 
            onClick={toggleAssignee} 
            label={<label>Assign these items to me</label>} 
            />
          </div>

          {renderCategories()}

          </div>

        </div>

        <div className={classes.footer}>

          <div className={classes.footerContent}>

          <Button 
          className='primary'
          onClick={saveItemsToGroup}
          >
          Done
          </Button>

          </div>

        </div>

      </div>


    );
  };
  
  export default OnboardingItems;