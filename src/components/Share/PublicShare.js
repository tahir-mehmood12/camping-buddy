import React, { useMemo, useState, useEffect } from 'react';

import {useLocation} from "react-router-dom";

import classes from './PublicShare.module.css';
import ChecklistSection from '../Checklist/ChecklistSection';

import Button from '../UI/Button';
import Loading from '../UI/Loading';
import { db } from '../../config';
import {  doc, onSnapshot } from 'firebase/firestore';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

const SectionItems = ({ sectionItems, group, filterMembers }) => {
return (
    <div className={classes.checklistSections}>
    {
        sectionItems?.map( (section, index ) => (
            <ChecklistSection 
            group={group}
            key={index}
            section={section}
            filterMembers={filterMembers}
            readonly={true}
        />
        ))
    }
    </div>
)
}

const Checklist = () => {

    const [group, setGroup] = useState();
    const [filterMembers, setFilterMembers] = useState();
    let query = useQuery();
    
    const sectionItems = useMemo(() => {
        //list items according to category
        const organisedItems = [];
        if (!group) return;
        const filterMembers = [...group.memberIds];
        filterMembers.push('unassigned');
        setFilterMembers(filterMembers);
        /*group.categories.forEach( (category, index) => {
            //get any group items that have this category
            const categoryItems = group?.items.filter( item => ( item.categories.includes(category) ))
            //Sort alphabetically (name)
            if (categoryItems.length>1) categoryItems.sort((a, b) => a.name.localeCompare(b.name));
            //set up object for the category and add items as an array
            const categoryObj = { id: index, title: category, items: categoryItems }
            //add category object to filtered items array
            organisedItems.push(categoryObj);
        }); */
        //organise by members - add unassigned items as well
        const members = [{id:'unassigned', name: 'Unassigned' }, ...group.members];
        members.forEach( (member, index) => {
            //get any group items that have been allocated to this member
            //apply filters - get number of items according to which member they are filtering
            const memberItems = group?.items.filter( ( item ) => {
                const result = item.organise.find (org => org.assigned === member.id)
                if ( result )  return ( item )
            });
            //Sort alphabetically (by item name)
            if (memberItems.length>1) memberItems.sort((a, b) => a.name.localeCompare(b.name));
            //set up object for the member and add items as an array
            const memberObj = { id: member.id, title: member.name, items: memberItems }
            //add member object to filtered items array
            organisedItems.push(memberObj);
        });  
        return organisedItems;
    }, [group]);
    

    useEffect(() => {
        const groupId = query.get("id");
        if (!groupId) return;
        setGroup();
        const unsubscribe = onSnapshot(doc(db, 'groups', groupId), (doc) => {
        if (doc.data()) {
          setGroup(doc.data());
        }
      });
      return () => {
        unsubscribe();
        setGroup();
      };
      }, []);



    if (!sectionItems) return (
        <Loading msg='Loading...'/>
    )
    
    return (
        <div className='container bg'>
        <div className={classes.checklistContainer}>

            <div className={classes.checklistHeading}>
                {group?.festival?.name}
                {group?.name && ` (${group.name})`}
            </div>   

            {group.notes && <div className={classes.groupNotes}>{group.notes}</div>}

            <div className={classes.callToAction}>
                <Button 
                    className='borderless'
                    onClick={()=>window.open('https://camping-buddy-site.web.app', '_self')}>
                    Sign up to Camping Buddy
                </Button>
                to help organise stuff for {group.festival.name}!
            </div>

            <SectionItems sectionItems={sectionItems} group={group} filterMembers={filterMembers}/> 
        
        </div>
        </div>

    );

}

export default Checklist;