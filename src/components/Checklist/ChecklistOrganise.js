import React, { useState, useContext, useMemo, useEffect } from 'react';
import classes from './ChecklistOrganise.module.css';

import AddIcon from '@mui/icons-material/Add';
import Button from '../UI/Button';

import Tab from '../Modals/Tab';
import Modal from '../Modals/Modal';

import { doc, updateDoc, where, arrayUnion, getDocs, query, collection } from 'firebase/firestore';
import { auth, db, METHODS } from '../../config';

import { UserContext } from '../../store/user-context';

import { DEFAULTVALUES } from '../../config';

import EditSubItem from '../Forms/EditSubItem';
import EditItemNotes from '../Forms/EditItemNotes';
import ChecklistAddOrganise from './ChecklistAddOrganise';
import Avatar from '../Group/Avatar';
import Protip from './Protip';
import parse from 'html-react-parser';

const ChecklistOrganise = ( { group, item, editGroupHandler, filterMembers } ) => {

    //organise item e.g. organise all tents

    const user = auth.currentUser;
    const UserCtx = useContext(UserContext);
    const festival = UserCtx.festival;
    const defaultItems = UserCtx.itemInfo;
    
    const [showOrganise, setShowOrganise] = useState(false);
    const [itemInfo, setItemInfo] = useState();
   
    //get data around how this item is being organised
    const organise = item.organise;
    const filteredItems = organise.filter ( org => filterMembers.includes(org.assigned) );
    const methods = filteredItems.map( item => item.method); //methods assigned to this item for anyone in the filtered list 
    const assignees = filteredItems.map( item => item.assigned); //members assigned to this item including anyone in the filtered list 
    
    /* cconst methods = []; 
    const assignees = []; 
    organise.forEach( org => {
        if (filterMembers?.includes(org.assigned)) {
            methods.push(org.method);
            assignees.push(org.assigned);
        }
    })*/
    
    const itemMethods = methods.filter(method => method); //get rid of null values
    const itemAssignees = assignees.filter(assignee => assignee && assignee !== 'unassigned'); //get rid of null values
    //if (item?.name === "Lantern") console.log(itemAssignees, itemMethods );
    let uniqueMethods = [...new Set(itemMethods)];
    let uniqueAssignees = [...new Set(itemAssignees)];
    
    const getItemInfo = () => {
        //get festival specific information about this item - either from festival collection or master list items if it's a custom event
        const itemName= item.name;
        //create object to get most up to date item info
        let _item = {};
        //decide which items we are going to search - for custom festivals search through the master packing list, otherwise search for festival items
        const itemInfoList = (festival) ? festival.items : defaultItems;
        //look for items in the list that have the same name as the current item
        _item = itemInfoList.find(i => (i.name.toLowerCase() === itemName.toLowerCase()));
        //if there's nothing found search for alternative spellings (useful for if they have added their own item)
        if ( !_item ) {
            _item = itemInfoList.find( item => {
                const akaArray = item.aka.split(','); 
                akaArray.push(item.name.toLowerCase()+'s');//add plural as well
                akaArray.map(aka => aka.trim().toLowerCase()); 
                return akaArray.includes(itemName);
            });
        }
            //console.log(itemName,item)
        let tipGeneral = _item ? _item.tip : null;
        let tipHiring =  _item ? _item["tip-hiring"] : null;
        let tipBuying =  _item ? _item["tip-buying"] : null;
        const hiringOption =  _item ? _item.hire : false;

        //only show hiring / buying information if it's not set to the default value and it's not null       
        if (DEFAULTVALUES.includes(tipHiring)) { tipHiring = null; } 
        if (DEFAULTVALUES.includes(tipBuying)) { tipBuying = null; } 

        if (tipHiring) tipHiring = parse(tipHiring);
        if (tipGeneral) tipGeneral = parse(tipGeneral);
        //if (tipBuying) tipBuying = parse(tipBuying);        

        const itemInfo = { id: item.id, general: tipGeneral, hireOption: hiringOption, hiring: tipHiring, buying: tipBuying };
        setItemInfo(itemInfo); 
    }
        
    const numberItems = organise ? organise.length : 0;
    const tabHeading = item ? `${item.name} x ${numberItems}` : '';

    const [itemNotifications, setItemNotifications] = useState(Array(numberItems));
    const generateItemNotification = (ind, notification) => {
        const newNotifications = [...itemNotifications];
        ind>-1 ? newNotifications[ind] = notification : newNotifications.push(notification);
        setItemNotifications(newNotifications);
    }
    
    const sendNotificationsToFirebase = async (email, memberNotifications ) => {
        if (!memberNotifications || memberNotifications.length<1 || !email) return;
        //add notification object to user record in db
        try {
            //get target user via email (not id)
            const q = query(collection(db, "users"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach( async(document) => {
                //loop through the person's notification
                memberNotifications.forEach(async(n) => {
                    await updateDoc(document.ref, {
                        //add to existing notifications in firebase
                        notifications: arrayUnion(n)
                        });
                   });
                });        
        } catch (err) {
            console.log(err);
        } 
    }

    const submitHandler = () => {
        //if there have been any changes made to the item then group these into notifications per group member and send this info to the DB as notification
        group.members.map( member => {
            sendNotificationsToFirebase(member.email, 
                itemNotifications.filter( n => n && n.assigned === member.id )
                );
        });
        //reset notifications array
        setItemNotifications(Array(numberItems));
        setShowOrganise(false);
    }

    const renderOrganiseMethodIcon = ( method, index ) => {

        const bgColour = (method === 'Buy') ? '#b10000' : '#C7DEA0';
        const textColour = (method === 'Buy') ? '#FFFFFF' : '#000000';
        
        //only show first letter of method e.g. B on smaller screens;
        const methodText = (window.innerWidth <= 800) ? 
            METHODS.find(m => m.id === method)?.abbreviation :
            method;

        return (
            <div className={classes.organiseMethodIcon} key={index}>
                <Button 
                    className='light'
                    style={{'backgroundColor': bgColour, 'color': textColour, 'borderColor': bgColour, 'fontSize':'8px'}}
                    onClick={()=>setShowOrganise(true)}
                    >
                    { methodText }
                </Button>
            </div>
        )

    }
    const renderOrganiseAvatarIcon = ( assignee, index, number ) => {
        const assigned = group.members.find(member => member.id === assignee);
        if (assigned) return (
            <div>
                <Avatar key={index} member={assigned} avatarSize='small' showName={false}/>
                {number && <div className={classes.avatarBadge}>+{number-1}</div>}
            </div>
             
        )
    }

    const renderOrganiseInfo = () => {

        return (
            <div key='1' className={classes.organiseIconsContainer}>

            { uniqueMethods?.map ( ( method, index ) => ( 

                renderOrganiseMethodIcon( method, index )

            ))}

                <Button 
                    className='noStyle'
                    onClick={()=>setShowOrganise(true)}
                    >
                    <div className={classes.organiseAvatarIcons}>
                        
                    {uniqueAssignees && renderOrganiseAvatarIcon( uniqueAssignees[0], 0, (uniqueAssignees && uniqueAssignees.length>1 && uniqueAssignees.length))}
                    
                    </div>
                    
                </Button>
            
            </div>

        )
    }

    useEffect(() => {
        if (!item || !group) return;
        getItemInfo();
      }, [item, group, festival, defaultItems]);
   
    if (showOrganise && item) return (

        <Modal 
        align='top' 
        back 
        title='Organise'
        onConfirm={()=>setShowOrganise(false)}
        onCancel={()=>setShowOrganise(false)}
        >

        <Tab closeHandler={()=>setShowOrganise(false)} title={tabHeading}>

            <div className={classes.organiseContainer}>

            <Protip itemInfo={itemInfo}/>

            <div className={classes.organiseSubItemsContainer}>

            { organise?.map ( ( subitem, index ) => ( 

                <EditSubItem
                    item={item}
                    subitem={subitem} 
                    key={index}
                    ind={index}
                    group={group}
                    generateItemNotification={generateItemNotification}
                    itemInfo={itemInfo}
                    editGroupHandler={editGroupHandler}
                    /> 

            ))}

            <div className={classes.organiseSubItemsAddContainer}>
                <ChecklistAddOrganise label='Add' item={item} group={group}/>
            </div>

            <EditItemNotes item={item} group={group}/>

            </div>

           

            <div className={classes.organiseFooter}>

                    <Button 
                        className='primary'
                        onClick={submitHandler}
                        >
                        Done
                    </Button>
                
                </div>

            </div>

        </Tab>

        </Modal>

    )
    

    if ( uniqueMethods?.length>0 || uniqueAssignees?.length>0 ) return (
        renderOrganiseInfo()
    )


    return (

        <Button 
            className='light'
            onClick={()=>setShowOrganise(true)}
            >
            Organise me
        </Button>

    );

}

export default ChecklistOrganise;