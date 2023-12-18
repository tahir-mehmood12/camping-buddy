import classes from './ChecklistHeader.module.css';

import ChecklistAdd from './ChecklistAdd';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '../UI/Button';

const ChecklistHeader = ( { section, isExpanded, setIsExpanded, filterMembers, group, readonly } ) => {
    
    const header=section.title;
    const id = section.id;
    
    //apply filters - get number of items according to which member they are filtering
    const filteredItems = section.items.filter( ( item ) => {
        let result = false;
        item.organise.forEach(org => {
            if ( filterMembers.includes(org.assigned) ) result = true;
        });
        if (result)  return ( item )
    });

    const length=filteredItems.length;
   
    return (
        <Button className='flex' onClick={() => setIsExpanded (!isExpanded)} >
        <div className={classes.checklistHeaderContainer}>
            
            <ChecklistAdd 
                group={group}
                label={header} 
                id={id}
                style={{ 'position': 'relative', 'top': '-10px',  'left': '10px'}}
                readonly={readonly}
                />

           

            <div className={classes.checklistHeaderGroup}>

                <div className={classes.checklistHeaderText}>
                    { length } { length === 1 ? `item` : `items`}
                </div>

                { isExpanded ? 
                <ExpandMoreIcon className={classes.checklistHeaderIcon} style={{ fontSize: 30}}  />: 
                <ChevronRightIcon className={classes.checklistHeaderIcon} style={{ cursor:'pointer', fontSize: 30}}/>
                }

            </div>

            

        </div></Button> 

    );

}

export default ChecklistHeader;