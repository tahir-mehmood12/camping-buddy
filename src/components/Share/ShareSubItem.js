
import classes from './Share.module.css';
import Avatar from '../Group/Avatar';


const ShareSubItem = ( { item, group, ind } ) => {

    const index = ind ? ind : 0;

    {/*render item name - if window is smaller then only render the number of the item otherwise show the full item name with item number*/}
    
    const itemName = item.organise?.length>1 ? `#${ind+1}` : null;
    const assignedMember = group.members.find(member => ( member.id === item.organise[index].assigned));
    
    return (
       
       <div className={classes.shareSubItemHolder} >

                    {itemName}
                    {assignedMember && <Avatar member={assignedMember}/>}
                    {!assignedMember && <div  className={classes.circle} > ? </div>}
                    {assignedMember ? `${assignedMember.name} will ` :'Someone needs to '} 
                    {item.organise[index].method ? item.organise[index].method.toLowerCase() : 'organise' }
    

        </div>

    );

}

export default ShareSubItem;