import React, { useState, useRef } from 'react';

import classes from './ChecklistItem.module.css';

import { db } from '../../config';
import {  doc, updateDoc  } from 'firebase/firestore';

import ChecklistItemAdd from './ChecklistItemAdd';
import ChecklistOrganise from './ChecklistOrganise';
import ChecklistItemProgress from './ChecklistItemProgress';
import EditGroup from '../Group/EditGroup';



const ChecklistItem = ( { group, item, category, handleDragStart, handleDragOver, handleDragEnd, filterMembers} ) => {

    const itemNameRef=useRef();
    const [working, setWorking] = useState(false);
    const [groupEditMode, setGroupEditMode] = useState(false);

   
    const filteredItems = item.organise?.filter ( org => filterMembers.includes(org.assigned) );
    //if (item?.name === "Lantern") console.log(filterMembers );
    const numberItems = filteredItems?.length;


    const handleKeyDown = (event) => {
        
        //submit form if enter key is pressed
        if (event.key === 'Enter') {
            handleNameChange();
        }
    }
    
    const handleNameChange = async () => {
        if (working) return;
    
        const itemName=itemNameRef.current.value;

        //avoid duplicate items
        if (itemNameRef.current.value !== item.name) {
            const LCItems = group.items.map( item => item.selected && item.organise.length>0 &&  item.name.toLowerCase());
            if (LCItems.indexOf(itemName.toLowerCase())!==-1) {
                alert('Doh! You already have this item in the list.'); 
                itemNameRef.current.value = item.name;
                return;
            }
        }

        setWorking(true);
        const itemIndex = group.items.findIndex(i => i.id === item.id);
        const updatedItem={
            ...group.items[itemIndex],
            name:itemName
        }
        const updatedItems = [...group.items];
        updatedItems[itemIndex] = updatedItem;
        try {
            const groupRef = doc(db, 'groups', group.id);
            await updateDoc(groupRef, { 
                items: updatedItems
            });
        } catch (err) {
            alert("There was a problem updating your group.")
        }
        setWorking(false);
    };

    if (!item) return;

    if (groupEditMode) return (
        <EditGroup group={group} onConfirm={() => setGroupEditMode(!groupEditMode)}/>
    )

    return (

        <div 
        className={classes.checklistItemContainer} 
        key={item.name} 
        draggable 
        onDragStart={(e)=>handleDragStart(e, item.id, item.name, category)}
        onDragOver={(e)=>handleDragOver(e, item.id, item.name, category)}
        onDragEnd={(e)=>handleDragEnd(e)}
        >

            <div className={classes.checklistItemNameContainer}>

                <ChecklistItemProgress item={item} group={group}/>

                <input
                    className={classes.checklistItemName}
                    id="itemname"
                    onBlur={handleNameChange}
                    defaultValue={item.name ? item.name : ''}
                    placeholder='Untitled item'
                    ref={itemNameRef}  
                    onKeyDown={handleKeyDown}
                    />

            </div>
            

            <div className={classes.numberContainer}>

                <ChecklistItemAdd 
                    direction='down' 
                    numberItems={numberItems} 
                    group={group}
                    item={item}
                    filterMembers={filterMembers}
                    />

                <div className={classes.numberText}>{numberItems}</div>

                <ChecklistItemAdd 
                    direction='up' 
                    numberItems={numberItems} 
                    group={group}
                    item={item}
                    filterMembers={filterMembers}
                    />


            </div>
            <div className={classes.organiseContainer}>
                    <ChecklistOrganise
                    group={group}
                    item={item}
                    editGroupHandler={()=>setGroupEditMode(true)}
                    filterMembers={filterMembers}
                    />
                </div>

                
           

          

        </div>

    );

}

export default ChecklistItem;