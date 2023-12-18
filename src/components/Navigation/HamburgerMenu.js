import React, { useState, useContext } from 'react';

import classes from './HamburgerMenu.module.css';

import { signOut } from 'firebase/auth';
import { auth} from '../../config';
import menu from '../../assets/icons/menu.png';
import Button from '../UI/Button';
import Avatar from '../Group/Avatar';
import SaveWork from '../Forms/SaveWork';

import Page from '../Modals/Page';

import icon_notes from '../../assets/icons/icon_notes.png';
import icon_logout from '../../assets/icons/icon_logout.png';
import icon_link from '../../assets/icons/icon_link.png';
import icon_contact from '../../assets/icons/icon_contact.png';
import icon_help from '../../assets/icons/icon_help.png';
import icon_info from '../../assets/icons/icon_info.png';
import icon_right from '../../assets/icons/icon_right.png';
import icon_partner from '../../assets/icons/icon_partner.png'; 
import icon_join from '../../assets/icons/icon_join.png';


import { UserContext } from '../../store/user-context';

const HamburgerMenu = ( { visible, setMenuVisible, group}) => {

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showResourcesModal, setShowResourcesModal] = useState(false);
    const [showPartnerModal, setShowPartnerModal] = useState(false);

    const UserCtx = useContext(UserContext);
    const user = auth.currentUser;



    const renderButton = ( title, icon, onClick) => {

        return (
            <Button className='flex' onClick={onClick}>
                
                <div className={classes.HB_button}>
                    <img src={icon}  alt={title} className={classes.HB_buttonIcon}  />
                    <div className={classes.HB_buttonText}> {title} </div>
                    <img src={icon_right}  alt='go' className={classes.HB_buttonArrow}  />
                </div>

            </Button>
        )

    }

    

    const renderProfile = () => {

        if (!UserCtx || !group) return;
        //get logged in user settings from context - from users table in database (includes name)
        const settings = UserCtx.settings;

        //to get avatar we need to query the current group (a person's avatar can change between groups)
        const member = group.members.find( member => member.id === settings.id);

        return (
            <div className={classes.HB_profile}>

                <div className={classes.HB_details}>

                    <div className={classes.HB_name}>
                        {settings.name} 
                    </div>

                    <div className={classes.HB_email}>
                        {settings.email} 
                    </div>

                </div>
               
                <div className={classes.HB_avatar}>

                    {member && <Avatar showName={false} key={member.id} member={member} avatarSize='large'/>}

                </div>

            </div>
        )
        }
    

    const handleSignout = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
      };

    const handleContact = () => {
        window.open('https://www.greenmusic.org.au/contact', 'pwtp');
    };

    const handleTerms = () => {
        window.open('https://www.partywiththeplanet.org/terms_of_service', 'pwtp');
    };

    const handleHelp = () => {
        alert('Functionality to be determined');
    };


    if (!visible) return;

    if (showInfoModal===true) return (
        <Page 
            setShowPage={setShowInfoModal} 
            id='JvZkMBggZUVzN2w4PDwM'
            />
    )

    if (showResourcesModal===true) return (
        <Page 
            setShowPage={setShowResourcesModal} 
            id='bLoDr1AAmDOo4tj7cRWo'
            />
    )

    if (showPartnerModal===true) return (
        <Page 
            setShowPage={setShowPartnerModal} 
            id='YCWSnkNTRyRGTp3l5Xj5'
            />
    )

    return (
       <div className={classes.HB_bg}>
       
       <div className={classes.HB_left} onClick={()=>setMenuVisible(false)} >&nbsp;</div>
       
       <div className={classes.HB_container}>

            <div className={classes.HB_iconContainer}>

                    <Button 
                        className='noStyle'
                        onClick={()=>setMenuVisible(false)} 
                        >

                        <img src={menu} 
                            alt='Menu icon' 
                            className={classes.HB_icon} 
                            />

                    </Button>

            </div>

            <div className={classes.HB_scrollContainer}>

                {renderProfile()}

                <div className={classes.HB_heading}>
                    Camping Buddy
                </div>

               

                { renderButton('About', icon_info, () => setShowInfoModal(true)) }

                { renderButton('Resources', icon_link, () => setShowResourcesModal(true)) }

                { renderButton('Partners', icon_partner, () => setShowPartnerModal(true)) }

                { renderButton('Contact us', icon_contact, handleContact) }

                { renderButton('Terms of service', icon_notes, handleTerms) }

                { renderButton('Help', icon_help, handleHelp) }

                { renderButton(` ${user.isAnonymous ? 'Log out (Guest)' : 'Log out'}`, icon_logout, handleSignout) }

                <SaveWork group={group} buttonProp={renderButton(`Sign up`, icon_join)}/>

            </div>
    
       </div>
       </div>
    );

}

export default HamburgerMenu;