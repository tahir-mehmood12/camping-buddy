
import classes from './Share.module.css';
import ShareSubItem from './ShareSubItem';


const ShareChecklistItem = ( { group, item} ) => {

    if (!item) return;

    return (

        <div className={classes.shareItemContainer} key={item.name}>

            <div className={classes.shareItemNameContainer}>
                <div className={classes.shareItemName}>{item.name}</div>
                {item.notes && <div className={classes.shareItemNotes}>{item.notes}</div>}
            </div>

            { item.organise?.map ( ( subitem, index ) => ( 

            <ShareSubItem
                item={item}
                key={index}
                ind={index}
                group={group}
                /> 
            ))}
            

        </div>

    );

}

export default ShareChecklistItem ;