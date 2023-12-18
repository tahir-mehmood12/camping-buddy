import React, { useContext, useState, useRef } from 'react';
import classes from './ChecklistAdd.module.css';

import AddIcon from '@mui/icons-material/Add';
import Button from '../UI/Button';
import { UserContext } from '../../store/user-context';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config';
import { generateId } from '../../config/helpers';
import Modal from '../Modals/Modal';
import SelectOptions from '../UI/SelectOptions';
import { ADD_CATEGORIES } from '../../config';

const ChecklistAdd = ( { label, item, group, style, id, readonly } ) => {

    const [working, setWorking] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [addMode, setAddMode] = useState('item');
    const user = auth.currentUser;
    
    const valueRef=useRef();
    const selectCategoryRef=useRef();
    const selectMemberRef=useRef();

    //get stuff from user context
    const UserCtx = useContext(UserContext);
    const sortMode = UserCtx?.sortMode; //members or categories
    const lastMemberAssigned = UserCtx?.lastAssignee; //last member they assigned to something
    //console.log('lastMemberAssigned',lastMemberAssigned);

    const handleKeyDown = (event) => {
        //submit form if enter key is pressed
        if (event.key === 'Enter') {
            addHandler();
        }
    }

    const selectOptionHandler = (val) => {
        setAddMode(val);
        setShowModal(!showModal);
    }
    
    const addHandler = async () => {

        //get entered value from form field (name or email address)
        const enteredValue = valueRef.current?.value;

        //get selected member from the dropdown list. If there is something there then assign it to user context to set as default next time
        const selectedMember = selectMemberRef.current?.value;
        if (selectedMember) UserCtx.setLastAssignee(selectedMember);

        if( !enteredValue || working ) return;

        setWorking(true);

        //add a new category to group 
        if (addMode === 'category') {
            //avoid duplicate categories
            const LCCategories = group.categories.map(category => category.toLowerCase());
            if (LCCategories.indexOf(enteredValue.toLowerCase())!==-1) {
                setWorking(false);
                alert('Doh! You already have this category in the list.'); 
                return;
            }
            const newCategories = [...group.categories];
            newCategories.push(enteredValue);
            try {
                const groupRef = doc(db, 'groups', group.id);
                await updateDoc(groupRef, { 
                    categories: newCategories,
                });
            } catch (err) {
                console.log("There was a problem updating your group.")
            }
        } 

        //ADDING ITEM
        //set up who the default person to be assigned to the new item is. 
        //the default is anyone they have selected in the drop down list if this is visible
        //if they haven't selected anyone then use the current user
        //We can't use the user.id, because the signed in user has a different user id to their member id (if someone else added them to the group before they signed up). So we have to search for the user's email to see if we can find a match, f we can't then we search for their name, and if that doesn't work we assign the new item to the group's owner.
        const findCurrentUserInGroup = group.members.find(member => ((member.email && member.email === user.email) || (member.name === user.name)));
        const defaultAssignedUser = 
            selectedMember ? selectedMember : 
            findCurrentUserInGroup ? findCurrentUserInGroup.id : 
            group.owner;
       
        if (addMode === 'item') {

            //avoid duplicate items
            const LCItems = group.items.map( item => item.selected && item.organise.length>0 &&  item.name.toLowerCase());
            if (LCItems.indexOf(enteredValue.toLowerCase())!==-1) {
                setWorking(false);
                alert('Doh! You already have this item in the list.'); 
                return;
            }

        }

        
        //add a new item to category (label) - if hitting add icon next to category heading
        if (addMode === 'item' && sortMode === 'categories' && label) {
            //get existing item e.g. if they deleted tent and now want to add tent. This will pick up any festival info associated with the item e.g. tent hiring options, instead of creating a new item for tents
            const existingItem = group.items.find( item => item.name.toLowerCase() === enteredValue.toLowerCase());

            //if existing item doesn't exist look for similar items e.g. sunnies instead of sunglasses to pick up any festival info associated with the item
            const similarItem = group.items.find( item => { 
                if (item.aka) {
                    const akaArray = item.aka.split(','); 
                    akaArray && akaArray.map(aka => aka.trim().toLowerCase()); 
                    return akaArray.includes(enteredValue.toLowerCase());
                }
            })
            
            //set up new item, generate id - use existing item if there is one
            const newItem = existingItem ? 
            { ...existingItem } : 
            similarItem ?  { ...similarItem, name:enteredValue } : 
            {
                categories:[`${label}`],
                name:enteredValue, 
                selected: true, 
            };
            //console.log(newItem); setShowModal(!showModal); setWorking(false); return;
            newItem.id = generateId(20);
            newItem.organise = [{ assigned: defaultAssignedUser, checked: false }];
            const updatedItems = [...group.items];
            updatedItems.push(newItem);
            try {
                const groupRef = doc(db, 'groups', group.id);
                await updateDoc(groupRef, { 
                    items: updatedItems
                });
            } catch (err) {
                console.log("There was a problem updating your group."+err)
            }
        }

        //add a new item to member (label) - if hitting add icon next to member heading
       if (addMode === 'item' && sortMode === 'members' && label && id) {
            //get selected category from modal
            const selectedCategory = selectCategoryRef.current.value;
            if (!selectedCategory || selectedCategory==='0') { 
                setWorking(false);
                alert('Oops! Looks like you forgot to select a category.'); 
                return;
            }
            //get existing item e.g. if they deleted tent and now want to add tent. This will pick up any festival info associated with the item e.g. tent hiring options, instead of creating a new item for tents
            const existingItem = group.items.find( item => item.name.toLowerCase() === enteredValue.toLowerCase());

            //if existing item doesn't exist look for similar items e.g. sunnies instead of sunglasses to pick up any festival info associated with the item
            const similarItem = group.items.find( item => { 
                const akaArray = item.aka.split(','); 
                akaArray.map(aka => aka.trim().toLowerCase()); 
                return akaArray.includes(enteredValue.toLowerCase());
            })

            //set up new item, generate id - use existing item if there is one
            const newItem = existingItem ? 
            { ...existingItem } : 
            similarItem ?  { ...similarItem, name:enteredValue } : 
            {
                name:enteredValue, 
                selected: true, 
            };
            newItem.id = generateId(20);
            newItem.categories = [`${selectedCategory}`];
            newItem.organise = [{ assigned: id, checked: false }];
            
            const updatedItems = [...group.items];
            updatedItems.push(newItem);
            try {
                const groupRef = doc(db, 'groups', group.id);
                await updateDoc(groupRef, { 
                    items: updatedItems
                });
            } catch (err) {
                console.log("There was a problem updating your group.")
            }
        }

         //add a new item - if hitting add icon in top menu
         if (addMode === 'item' && !label) {
            //get selected category from modal
            const selectedCategory = selectCategoryRef.current.value;
            if (!selectedCategory || selectedCategory==='0') { 
                setWorking(false);
                alert('Oops! Looks like you forgot to select a category.'); 
                return;
            }

            //get existing item e.g. if they deleted tent and now want to add tent. This will pick up any festival info associated with the item e.g. tent hiring options, instead of creating a new item for tents
            const existingItem = group.items.find( item => item.name.toLowerCase() === enteredValue.toLowerCase());

            //if existing item doesn't exist look for similar items e.g. sunnies instead of sunglasses to pick up any festival info associated with the item
            const similarItem = group.items.find( item => { 
                const akaArray = item.aka.split(','); 
                akaArray.map(aka => aka.trim().toLowerCase()); 
                return akaArray.includes(enteredValue.toLowerCase());
            })

            //set up new item, generate id - use existing item if there is one
            const newItem = existingItem ? 
            { ...existingItem } : 
            similarItem ?  { ...similarItem, name:enteredValue } : 
            {
                name:enteredValue, 
                selected: true, 
            };
            newItem.categories = [`${selectedCategory}`];
            newItem.id = generateId(20);
            newItem.organise =  [{ assigned: defaultAssignedUser, checked: false }];
            
            const updatedItems = [...group.items];
            updatedItems.push(newItem);
            try {
                const groupRef = doc(db, 'groups', group.id);
                await updateDoc(groupRef, { 
                    items: updatedItems
                });
            } catch (err) {
                console.log("There was a problem updating your group.")
            }

        }

        setShowModal(!showModal); setWorking(false); return;
       
    }



    if (showModal) return (
        <Modal 
            align='top' 
            back 
            title={`Add ${addMode}`}
            onConfirm={addHandler}
            onCancel={()=>setShowModal(!showModal)}
            >
           
           {working &&  <p>Adding stuff...</p> }

            {!working && 
            <>
                <input 
                    id="val" 
                    placeholder={`Enter ${addMode}`}
                    ref={valueRef}  
                    onKeyDown={handleKeyDown}
                    />

                {/*need to specify member if selecting item from top add button or selecting add item from category heading*/
                (addMode==='item' && (!label || sortMode==='categories')) && 
                <select 
                    id={item?.id+'member'} 
                    className={classes.selectInput} 
                    ref={selectMemberRef} 
                    defaultValue={lastMemberAssigned}
                    >
                    <option value={0}>Select member</option>
                    {group?.members.map( (member, index ) => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                </select>
                }

                {/*need to specify category if selecting item from top add button or selecting add item from member heading*/
                (addMode==='item' && (!label || sortMode==='members')) && 
                <select 
                    id='category' 
                    className={classes.selectInput} 
                    ref={selectCategoryRef} 
                    >
                    <option value={0}>Select category</option>
                    {group?.categories.map( (cat, index ) => (
                        <option key={index} value={cat}>{cat}</option>
                    ))}
                </select>
                }
            </>
            }
           
        
        </Modal>
    )
    if (readonly) return (
        <div className={classes.checklistAddGroup} style={style}>

        <div 
            className={classes.checklistReadonlyHeader}
            >
            {label}
        </div>
        </div>

    )

    if (label) return (
        <div className={classes.checklistAddGroup} style={style}>

        <div className={classes.checklistAddLabel}>
            {label}
        </div>


        <Button 
            className='addButtonIcon'
            onClick={()=>setShowModal(!showModal)}
            >

            <AddIcon style={{fontSize: 20}}/>

        </Button>

        </div>
    )

    return (

        <SelectOptions 
            title='Add' 
            icon='add' 
            options={ADD_CATEGORIES} 
            selectedOption={null}
            setSelectedOption={selectOptionHandler}
            />

       

    );

}

export default ChecklistAdd;