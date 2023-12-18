import React, { useMemo, useState, useEffect } from 'react';

import classes from './CategorySection.module.css';
import Button from '../UI/Button';

const RenderItem = ({ item, updateItem }) => {
    const [selected, setSelected] = useState(true);

    const toggleItem = () => {
        if (!item) return;
        updateItem(item.id, !selected);
        setSelected(!selected);
    }

    if (!item) return;
    return (
        <Button className='noStyle'>
        <div 
            onClick={toggleItem}
            className={`${classes.item} ${selected ? classes.itemOn : classes.itemOff}`} 
            >
        {item.name}
        </div>
        </Button>           
    )
}

const CategorySection = ( { items, category, updateItem } ) => {

    const sectionItems = useMemo(() => {
        //get any group items that have this category
        const categoryItems = items?.filter( item => ( item.categories.includes(category) ))
        //Sort alphabetically (name)
        if (categoryItems?.length>1) categoryItems.sort((a, b) => a.name.localeCompare(b.name));
        return categoryItems;
    }, [items, category]);

    
    
    if (!category || !items ) return;
    
    return (

        <div className={classes.container}>

            <div className={classes.heading}>{category}</div>

            { !sectionItems &&  <div className='note'>Loading...</div> }

            { sectionItems?.length===0 &&  <div className='note'>Nothing allocated yet.</div> }

            <div className={classes.items}>

            { sectionItems?.map((item,index) => (
                <RenderItem item={item} key={index} updateItem={updateItem}/>
            ))}

            </div>

        </div>

    );

}

export default CategorySection;