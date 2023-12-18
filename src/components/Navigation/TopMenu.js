import React, { useState, useRef } from 'react';
import { db } from '../../config';
import {  doc, updateDoc  } from 'firebase/firestore';

import classes from './TopMenu.module.css';
import HamburgerMenu from './HamburgerMenu';
import menu from '../../assets/icons/menu.png';
import Button from '../UI/Button';
import FestivalInfo from '../Modals/FestivalInfo';

const TopMenu = ( { group } ) => {

    const [menuVisible, setMenuVisible] = useState(false);
    const [festivalInfoVisible, setFestivalInfoVisible] = useState(false);
    const groupNameRef=useRef();
    //console.log(group?.name)

    const handleNameChange = async () => {
        const groupName=groupNameRef.current.value;
        if (!groupName){ return;} else {
            //update group name record in db
            try {
                const groupRef = doc(db, "groups", group.id);
                await updateDoc(groupRef, {
                    name:groupName
                  });
              } catch (err) {
                console.log(err);
              }
        }
    };
    
    return (

        <>

        <div className={classes.topMenu}>

        <div className={classes.topMenuContainer} key={group.name+"groupname"}>

            <input
                className={classes.nameInput}
                id={group.id+"groupname"}
                onBlur={handleNameChange}
                maxLength="30"
                defaultValue={group?.name}
                placeholder='Untitled group'
                spellCheck='false'
                ref={groupNameRef}  />

            <Button 
                className='noStyle'
                onClick={()=>setMenuVisible(!menuVisible)} 
                >

                <img src={menu} 
                    alt='Menu icon' 
                    className={classes.icon} 
                    />

            </Button>

        </div>

        </div>

        <HamburgerMenu 
            visible={menuVisible}
            setMenuVisible={setMenuVisible}
            group={group}
            />

        <Button 
            className='noStyle'
            onClick={()=>setFestivalInfoVisible(!festivalInfoVisible)} 
            >
            <div className={classes.festivalName}>{group?.festival?.name}</div>
        </Button>
      

        { festivalInfoVisible && 
            <FestivalInfo 
                id={group?.festival?.id}
                onConfirm={()=>setFestivalInfoVisible(false)}
                onCancel={()=>setFestivalInfoVisible(false)}
            /> 
        }
        
        </>

    );

}

export default TopMenu;