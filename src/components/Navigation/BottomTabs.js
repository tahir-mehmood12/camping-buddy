import React, { useState, useEffect, useContext } from 'react';

import classes from './BottomTabs.module.css';

import icon_home from '../../assets/icons/icon_home.png';
import icon_inbox from '../../assets/icons/icon_inbox.png';
import icon_list from '../../assets/icons/icon_list.png';
import icon_settings from '../../assets/icons/icon_settings.png';

import { UserContext } from '../../store/user-context';

import Button from '../UI/Button';

const getNumberNotifications = (settings) => {
     //get number of unread notifications for the current user
     
    if (!settings.notifications) return 0;
    const displayNotifications = settings.notifications.filter(n => n.status ==='unread');
    if (displayNotifications) { return  displayNotifications.length; } else { return 0;}
}

const Tab = ( { title, id, img, currentScreen, setCurrentScreen} ) => {

    const active = currentScreen === id;
    const UserCtx = useContext(UserContext);
    const badgeNumber = ( id==='notifications' ) ? getNumberNotifications(UserCtx.settings) : 0;
    

    return (
       <Button className='noStyle' onClick={() =>setCurrentScreen(id)}>

        <div className={classes.tab}>

            <img src={img} 
                alt='' 
                className={active ? classes.iconActive : classes.iconInactive}
                />

                { badgeNumber > 0 && 
                    <div className={`${classes.tabBadge} ${active ? classes.tabBadgeActive : classes.tabBadgeInactive}`}>
                        {badgeNumber}
                    </div>
                }

            <div 
                className={active ? classes.titleActive : classes.titleInactive}>
                { title }
                </div>

        </div>

       </Button>
    );

}

const BottomTabs = ( { currentScreen, setCurrentScreen } ) => {

    const UserCtx = useContext(UserContext);

    useEffect(() => {
        if (!UserCtx) return;
        //console.log(UserCtx.settings)
      }, [UserCtx]);

    return (
       <div className={classes.container}>

        <div className={classes.tabs}>
       
            <Tab 
            title="Home" 
            id={'home'} 
            img={icon_home}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen} 
            />

            <Tab 
            title="List" 
            id={'list'} 
            img={icon_list}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen} 
            />

            <Tab 
            title="Notifications" 
            id={'notifications'} 
            img={icon_inbox}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            />

            <Tab 
            title="Settings" 
            id={'settings'} 
            img={icon_settings}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen} 
            />

       </div>

       </div>
    );

}

export default BottomTabs;