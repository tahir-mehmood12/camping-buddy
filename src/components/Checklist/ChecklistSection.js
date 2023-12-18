import React, {useState, useMemo, useEffect } from 'react';

import classes from './ChecklistSection.module.css';

import ChecklistHeader from './ChecklistHeader';
import ChecklistItem from './ChecklistItem';
import ShareChecklistItem from '../Share/ShareChecklistItem';


const ChecklistSection = ( { group, section, filterMembers, readonly, handleDragStart, handleDragOver, handleDragEnd } ) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState();


    //filter items according to which member/s has been seletced in the top filter
    useEffect(() => {
        const items = section.items?.filter((item,index) => {
            //apply filterMembers - if filter members includes anyone who has been assigned to this item
            let result = false;
            item.organise.forEach(org => {
                if ( filterMembers.includes(org.assigned) ) result = true;
            });
            if (result) return item;
        });
        const sortedItems = items.sort(function(a, b) { return a.order - b.order; });
        setItems(sortedItems);
    }, [section, filterMembers]);

    
   

    return (

        <div className={classes.checklistSectionContainer}>

            <ChecklistHeader 
                section={section}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                filterMembers={filterMembers}
                group={group}
                readonly={readonly}
                />

            { isExpanded && !readonly && 
                <div className={classes.checklistItemsContainer}>

               { items?.map ((item, index) => 
                    <ChecklistItem 
                        group={group}
                        key={index} 
                        item={item} 
                        category={section.title}
                        handleDragStart ={handleDragStart}
                        handleDragOver = {handleDragOver}
                        handleDragEnd = {handleDragEnd}
                        filterMembers={filterMembers}
                    />
                ) }

                </div>
            }

            { isExpanded && readonly && 
                <div className={classes.checklistItemsContainer}>

               { items?.map ((item, index) => 
                    <ShareChecklistItem 
                        group={group}
                        key={index} 
                        item={item} 
                    />
                ) }

                </div>
            }

        </div>

    );

}

export default ChecklistSection;