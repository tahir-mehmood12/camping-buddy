import React, { useState} from 'react';

import classes from './GroupMembers.module.css';

import Avatar from './Avatar';
import { auth } from '../../config';
import Button from '../UI/Button';
import AddIcon from '@mui/icons-material/Add';
import EditGroup from './EditGroup';

const MemberAvatars = ({ members, avatarSize, selected, selectHandler }) => {
    //console.log('selected',selected)
    return (
       <>
        {members.map( member => 
            <Button 
            key={member.id} 
            className='noStyle' 
            >
                <Avatar 
                    style={{"marginLeft":"-10px"}}
                    showName 
                    member={member}
                    avatarSize={avatarSize}
                    isSelected={selected?.includes(member.id)}
                    setSelected={()=>selectHandler(member.id)}
                />
            </Button>
            )}
       </>
    )
}

const GroupMembers = ({ group, avatarSize, displayMode, selected, setSelected, groupEditMode, setGroupEditMode} ) => {

   
    const showAddGroup = () => {
        setGroupEditMode(true);
    }

    const selectHandler = (id) => {
        if (setSelected && selected) {
            let newSelection = [...selected];
            if (id === 'all') {
                //select all members
                newSelection = membersAll.map(member => member.id);
                newSelection.push ('unassigned');
            } else {
                //toggle individual avatars
                if (selected) {
                    //what to do if they click on avatar icon
                    //select only this avatar
                    newSelection = [];
                    newSelection.push(id);
                    //if there's only one member in the group then add unassigned itmes otherwise we won't be able to access them becuase there is no ALL option
                    if (membersAll.length === 1) {
                        newSelection.push ('unassigned');
                    }
                    /*if (membersAll.length === selected.length) {
                        newSelection = [];
                        newSelection.push(id);
                    } */
                    //is the member already selected?
                    /*const selectionIndex = newSelection.indexOf(id);
                    ( selectionIndex === -1 ) ? 
                        //add to selection
                        newSelection.push(id):
                        //remove from selection
                        newSelection.splice(selectionIndex, 1);*/
                }
            }
            setSelected(newSelection);
        }
        
    }

    const renderEditGroup = () => {
        if (!group) return;
        return (
            <>
            { groupEditMode ? 
            
                <EditGroup group={group} onConfirm={() => setGroupEditMode(!groupEditMode)}/> :

                <Button 
                    className='noStyle' 
                    onClick={() => setGroupEditMode(!groupEditMode)}
                    >
                    <div 
                        className={`${classes.Group_membersCircle} ${classes.Group_addCircle}` }
                        >
                       <AddIcon style={{ fontSize: 20}}/>
                    </div>
                </Button>
        
            }
            </>
        )
    }

    if (!group.members) return;

    //display mode determines how member avatars shold be displayed. Options are:
    // minimal (default) - hide avatars and only show + and number of mebers
    // expanded - show all avatars

    const user = auth.currentUser;
    const userId = user.uid;
    const userEmail = user.email;

    //size of avatar icon
    let imgSizeClass;
    switch (avatarSize){
        case 'small': imgSizeClass = classes.imgSmall; break;
        case 'medium': imgSizeClass = classes.imgMedium; break;
        case 'large': imgSizeClass = classes.imgLarge; break;
        case 'huge': imgSizeClass = classes.imgHuge; break;
        default: imgSizeClass = classes.imgMedium;
    }

    const membersAll = group.members;
    const memberUser = group.members.find( member => member.email === userEmail);
    const membersOther = group.members.filter( member => member.email !== userEmail);
    //console.log('membersOther',membersOther)

    return (
        <div className={classes.Group_avatars}>

            {/*render user avatar - to get avatar we need to query the current group (a person's avatar can change between groups) */}
            <div className={classes.Group_avatar}>
                {memberUser && 
                    <Avatar 
                        key={memberUser.id} 
                        showName={displayMode === 'minimal' ? 'long': memberUser.name === "Guest" ? 'long' : 'short'}
                        member={memberUser}
                        avatarSize={avatarSize}
                        isSelected={selected?.includes(memberUser.id)}
                        setSelected={()=>selectHandler(memberUser.id)}
                        />
                }
            </div>

            {/*render other group avatars - expanded*/}
            { membersOther.length > 0 && displayMode === 'expanded' && 
                <MemberAvatars 
                members={membersOther} 
                avatarSize={avatarSize}
                selected={selected}
                setSelected={setSelected}
                selectHandler={selectHandler}
                />
            }

            {/*render other group avatars - minimal*/}
            { membersOther.length > 0 && displayMode === 'minimal' && 
                <Button 
                    className='noStyle' 
                    onClick={()=>setGroupEditMode(!groupEditMode)}
                    >
                    <div 
                        className={`${classes.Group_membersCircle} ${imgSizeClass}` }
                        >
                       +{membersOther.length}
                    </div>
                </Button>
            }

            {/*render all button - expanded*/}
            { membersOther.length > 0 && displayMode === 'expanded' && 
                <Button 
                    className='noStyle' 
                    style={{"marginLeft":"-10px"}}
                    onClick={()=>selectHandler('all')}
                    >
                    <div 
                        className={`
                            ${classes.Group_membersCircle} 
                            ${imgSizeClass}
                            ${(membersAll.length <= selected?.length) && classes.Group_membersselectedImg}
                        ` }
                        >
                       ALL
                    </div>
                </Button>
            }

            {/*render add button - expanded*/}
            { displayMode === 'expanded' && 
                renderEditGroup()
            }



        </div>

    );

}

export default GroupMembers;