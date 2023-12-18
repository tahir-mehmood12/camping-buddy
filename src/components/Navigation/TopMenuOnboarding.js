import React, { useState} from 'react';

import classes from './TopMenu.module.css';
import Button from '../UI/Button';
import FestivalInfo from '../Modals/FestivalInfo';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const TopMenuOnboarding = ( { title, group, backHandler } ) => {

    const [festivalInfoVisible, setFestivalInfoVisible] = useState(false);

    
    return (

        <>

        <div className={classes.topMenu}>

        <div className={classes.topMenuContainer}>

            <Button 
                className='noStyle'
                onClick={backHandler ? backHandler : null} 
                >
                <ArrowBackIosIcon style={{ fontSize: 30, opacity: backHandler ? 1 : 0 }} />

            </Button>

            <div className={classes.topMenuTitle}>{title}</div>

        </div>

        </div>

        { group?.festival && 
            <Button 
                className='noStyle'
                onClick={()=>setFestivalInfoVisible(!festivalInfoVisible)} 
                >
                <div className={classes.festivalName}>{group.festival.name}</div>
            </Button>
        }
      

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

export default TopMenuOnboarding;