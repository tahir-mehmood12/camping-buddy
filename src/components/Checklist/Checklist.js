import React, { useMemo, useState, useContext, useEffect } from 'react';

import classes from './Checklist.module.css';
import { SORT_CATEGORIES, SHARE_CATEGORIES } from '../../config';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';

import SaveWork from '../Forms/SaveWork';

import Button from '../UI/Button';
import Loading from '../UI/Loading';
import Share from '../Share/Share';

import ChecklistSection from './ChecklistSection';

import GroupMembers from '../Group/GroupMembers';
import SelectOptions from '../UI/SelectOptions';
import GroupNotes from '../Modals/GroupNotes';
import EditGroup from '../Group/EditGroup';

import ChecklistAdd from './ChecklistAdd';

import { UserContext } from '../../store/user-context';

const SectionItems = ({ sectionItems, group, filterMembers }) => {
     //drag and drop ordering
     const [working, setWorking] = useState(false);
     const [currentDrag, setCurrentDrag] = useState();
     const [currentDragOver, setCurrentDragOver] = useState();

     //when items are drag and dropped the group items must be reordered to suit
    //handle sort is called from child component ChecklistItem
    const  handleDragEnd = async (e) => {
        setWorking(false);
        
        //don't do anything if they haven't dragged or dropped or it's still working
        if (working || !currentDrag || !currentDragOver) return;
        //do nothing if they've dropped the item onto itself
        if (currentDrag.id === currentDragOver.id) return;
        e.preventDefault();
        setWorking(true);
        
        //duplicate items
        const _items = [...group.items];
        const dragIndex = _items.findIndex( item => item.id === currentDrag.id);
        const dragOverIndex = _items.findIndex( item => item.id === currentDragOver.id);
        //get drag item object
        const dragItemContent = _items[dragIndex];
        
        //make sure drag item category array includes the category they are dropping into (in case they are dragging and dropping items between categories)
        if (!dragItemContent.categories.includes(currentDragOver.category)) {
            //find category they were dragging from and replace with drop category
            const currentCatIndex = dragItemContent.categories.indexOf(currentDrag.category);
            dragItemContent.categories[currentCatIndex] = currentDragOver.category;
        }
        //remove previous drag item from the group items
        _items.splice(dragIndex,1);
        //add to where the drop item is 
        _items.splice(dragOverIndex, 0, dragItemContent)
        //reset order property according to new position in array
        _items.map( (item, index) => item.order = index);
        //console.log(_items.map(item => (item.order+' '+item.name+' '+item.categories[0]))); return
        {/*update order of items in groups collection in firebase*/}
        {if (group && group.id) {
            try {
                const groupRef = doc(db, 'groups', group.id);
                await updateDoc(groupRef, { 
                items: _items
                });
            } catch (err) {
                alert("There was a problem updating your group.")
            }
        }}
        setCurrentDrag();
        setCurrentDragOver();
        setWorking(false);
    }

    //handleDragStart function is called from child component ChecklistItem.
    const handleDragStart = async (e, id, name, category) => {
        setCurrentDrag({id: id, name: name, category:category})
    }
    
    //handleDragOver function is called from child component ChecklistItem. Add prevent default to on drag over functionality to call the sort function faster
    const handleDragOver = async (e, id, name, category) => {
        e.preventDefault();
        setCurrentDragOver({id: id, name: name, category:category})
    }

    return (
        <div className={classes.checklistSections}>
        {
            sectionItems?.map( (section, index ) => (
                <ChecklistSection 
                group={group}
                key={index}
                section={section}
                filterMembers={filterMembers}
                handleDragStart ={handleDragStart}
                handleDragOver = {handleDragOver}
                handleDragEnd = {handleDragEnd}
            />
            ))
        }
       </div>
    )
}

const Checklist = ( { group } ) => {

    //get previous sort mode from user context
    const UserCtx = useContext(UserContext);
   
    const [sortMode, setSortMode] = useState( UserCtx?.sortMode? UserCtx.sortMode : 'categories');
    //const initialMembers = [...group?.memberIds, 'unassigned'];
    const [filterMembers, setFilterMembers] = useState([...group?.memberIds, 'unassigned']);
    //console.log('filterMembers',filterMembers)
    const [categories, setCategories] = useState(group?.categories);
    const [shareMode, setShareMode] = useState('all');
    const [groupEditMode, setGroupEditMode] = useState(false);
    
    //console.log(group.id)
;    const sectionItems = useMemo(() => {
        //list and organise items according to sort mode 
        const organisedItems = [];
        switch (sortMode) {
            case 'categories':
            //organise by categories
            categories.forEach( (category, index) => {
                //get any group items that have this category
                const categoryItems = group?.items.filter( item => ( item.categories.includes(category) ))
                //Sort alphabetically (name)
                if (categoryItems.length>1) categoryItems.sort((a, b) => a.name.localeCompare(b.name));
                //set up object for the category and add items as an array
                const categoryObj = { id: index, title: category, items: categoryItems }
                //add category object to filtered items array
                organisedItems.push(categoryObj);
            });  
            //sortedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
            case 'members':
            //organise by members
            group?.members.forEach( (member, index) => {
                //get any group items that have been allocated to this member
                //apply filters - get number of items according to which member they are filtering
                const memberItems = group?.items.filter( ( item ) => {
                    const result = item.organise.find (org => org.assigned === member.id)
                    if ( result )  return ( item )
                });
                //Sort alphabetically (name)
                if (memberItems.length>1) memberItems.sort((a, b) => a.name.localeCompare(b.name));
                //set up object for the category and add items as an array
                const memberObj = { id: member.id, title: member.name, items: memberItems }
                //add member object to filtered items array
                organisedItems.push(memberObj);
            });  
            break;
            default:
            //default is to sort newest to oldest
            //sortedEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return organisedItems;
    }, [group, sortMode, categories]);

    useEffect(() => {
        if (!sortMode) return;
        //sort mode has changed - update context
        UserCtx.setSortMode(sortMode)
      }, [sortMode]);

      useEffect(() => {
        if (!group) return;
        //group has changed - reset member filter
        //console.log('group has changed',group);
        setCategories(group.categories);
        setFilterMembers([...group.memberIds, 'unassigned']);
      }, [group]);

    
    const renderChecklistTop = () => {
        return (
        <div className={classes.checklistTop}>

            <div className={classes.checklistButtonGroup}>

            <SelectOptions 
                title='Sort by' 
                icon='sort' 
                options={SORT_CATEGORIES} 
                selectedOption={sortMode}
                setSelectedOption={setSortMode}
                />

            <SaveWork group={group} icon='share'/>

            <Share group={group}/>

            {/*<SelectOptions 
            title='Share' 
            icon='share' 
            options={SHARE_CATEGORIES} 
            selectedOption={shareMode}
            setSelectedOption={setShareMode}
             />*/}

            <GroupNotes group={group}/>

            <ChecklistAdd group={group}/>

            </div>

            <GroupMembers 
                group={group} 
                avatarSize='large' 
                displayMode='expanded' 
                selected={filterMembers}
                setSelected={setFilterMembers}
                groupEditMode={groupEditMode}
                setGroupEditMode={setGroupEditMode}
                />

                

          

        </div>
        )
    }

    const renderChecklistHeading = () => {
        return (
        <div className={classes.checklistHeading}>
            <div className={classes.checklistHeadingTextHolder}>
                <div className={classes.checklistHeadingText}>List</div>
                <div className={classes.checklistHeadingUnderline}>&nbsp;</div>
            </div>

           

        </div>
        )
    }



    if (!sectionItems) return (
    <Loading msg='Loading...'/>
    )
    
    if (groupEditMode && group) return (
        <EditGroup group={group} onConfirm={() => setGroupEditMode(!groupEditMode)}/>
    )

    return (

        <div className={classes.checklistContainer}>

        {renderChecklistTop()}

        {/*renderChecklistHeading()*/}
        
        {/*<div className={classes.checklistSaveBar}>
            <div className={classes.checklistSaveGroup}>

                <SaveWork group={group}/>
                
                <SelectOptions 
                title='Share' 
                icon='share' 
                options={SHARE_CATEGORIES} 
                selectedOption={shareMode}
                setSelectedOption={setShareMode}
                />
                
            </div>

           <ChecklistAdd group={group}/>

        </div>
    */}
        <SectionItems sectionItems={sectionItems} group={group} filterMembers={filterMembers}/>
        
        </div>

    );

}

export default Checklist;