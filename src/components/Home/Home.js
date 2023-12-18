import React, { useMemo, useState, useEffect, useContext } from 'react';

import classes from './Home.module.css';

import { Link } from 'react-router-dom';
import Button from '../UI/Button';

import Weather from './Weather';
import World from './World';

import { auth, db } from '../../config';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, Timestamp, getDocs } from 'firebase/firestore';

import EditGroup from '../Group/EditGroup';
import GroupMembers from '../Group/GroupMembers';
import ReactCurvedText from 'react-curved-text';
import { UserContext } from '../../store/user-context';

const Home = ({ group, festival, festivalInfo, setCurrentScreen }) => {

    const [organised, setOrganised] = useState();
    const [groupEditMode, setGroupEditMode] = useState(false);
    const [daysToGo, setDaysToGo] = useState();
    const UserCtx = useContext(UserContext);

    const logSession = async (user) => {
        try {
          //add new user to users collection
          await addDoc(collection(db, "sessions"), {
            userid: user.id,
            username: user.name,
            festival: festivalInfo? festivalInfo.name : null,
            createdAt: Timestamp.fromDate(new Date())
          });
          //console.log(user.name, 'session logged');
        } catch (err) {
          console.log(err.message);
        }
      }

    
    const renderEditGroup = () => {
        if (!group) return;
        return (
            <>
            { groupEditMode ? 
            
                <EditGroup group={group} onConfirm={() => setGroupEditMode(!groupEditMode)}/> :

                <Button 
                    className='borderless' 
                    onClick={() => setGroupEditMode(!groupEditMode)}
                    >
                    { group.members.length > 1 ? 'Edit group' : 'Add people' }
                </Button>
        
            }
            </>
        )
    }
    
    const renderBottomButton = () => {
        if (!group) return;

        /*the festival has entered any warning info then prioritise displaying this*/
        if (festivalInfo) {
            if (festivalInfo.warning) { return (
                <div className={classes.warningContainer}>
                <div className={classes.warning}>{festivalInfo.warning}</div>
                </div> 
            )
            }
        }

        /*If organising is under way then render random quote from festival artist*/
        if (UserCtx.settings.activeOrganiser) return (
            <div className={classes.artistQuoteContainer}>
                <div className={classes.artistQuote}>{randomArtistQuote.quote}</div>
                <div className={classes.artistName}>{randomArtistQuote.name}</div>
            </div> 
        )

        /*If this user hasn't organised anything before then render call to action*/
        return (
            <Button 
                onClick={() =>setCurrentScreen('list')}
                className='primary'
                >
                Organise your list
            </Button>
        )
    }

    const renderBannerText = () => {
        if (!daysToGo || daysToGo < 1) return;
        const bannerText = daysToGo === 1  ? `Tomorrow !!!` : `${daysToGo} Days to Go`;

        /*
            Prop	Type	Required	Description
            text	string	yes	Text to be displayed
            width	number	yes	Width of the SVG
            height	number	yes	Height of the SVG
            cx	number	yes	Center x of the ellipse
            cy	number	yes	Center y of the ellipse
            rx	number	yes	Radius x of the ellipse
            ry	number	yes	Radius y of the ellipse
            startOffset	number	no	Start offset of the text
            reversed	boolean	no	Reverse the text path
            textProps	object	no	Props to be passed to the text element
            textPathProps	object	no	Props to be passed to the textPath element
            tspanProps	object	no	Props to be passed to the tspan element
            ellipseProps	object	no	Props to be passed to the ellipse element
            svgProps	object	no	Props to be passed to the svg element
            */
         return (
           
            <div className={classes.homeBannerText}>
                 <ReactCurvedText
                    width={600}
                    height={52}
                    cx={300}
                    cy={230}
                    rx={200}
                    ry={200}
                    startOffset={240}
                    reversed={true}
                    text={bannerText }
                    textProps={{ style: { fontSize: 24 } }}
                    textPathProps={null}
                    tspanProps={null}
                    ellipseProps={null}
                    svgProps={null}
                />
            </div>
        )
    }

    //fetch random quote from festival artist
    const randomArtistQuote = useMemo(() => {

        //how many days to go info
        const bannerText = daysToGo === 1  ? `Tomorrow !!!` : `${daysToGo} Days to Go`;
        const banner = {quote: bannerText, name:'' }

        //set default quote if festivals don't have any quotes
        let quote = { name:'Barkaa', quote:`Caring for the earth is not a trend. It's vital.` };
        if (festival?.quotes) {
            //get number of available quotes for the group's festival
            const numberAvailableQuotes = festival?.quotes?.length;
            //get random integer between 0 and number of available quotes
            const randomIndex = Math.floor(Math.random() * (numberAvailableQuotes-1));
            //fetch random quote
            quote = festival.quotes[randomIndex];
        }
        const randomNo = Math.floor(Math.random() * (2 - 1 + 1) + 1);
        return (randomNo === 1 && daysToGo && daysToGo>0) ? banner : quote;
    }, [festival, daysToGo]);

    useEffect(() => {
        if (!group) return;
        //group has changed - see whether any items have been organised yet
        const alreadyOrganised = group.items.some(obj => obj.hasOwnProperty('organisation')); 
        //if no items have been organised then change state to show 'make list' button
        setOrganised(alreadyOrganised);
      }, [group]);

      useEffect(() => {
        if (!UserCtx) return;
        //log session
        logSession(UserCtx.settings);
      }, [UserCtx])

      

    return (
    <div className={classes.container}>

        <Weather festival={festival}  setDaysToGo={setDaysToGo}  />

        <div className={classes.homeWorldContainer}>

            {/* renderBannerText()*/ }

            <div className={classes.homeWorld}>
                <World group={group} festivalName={festival?.name} />
            </div>

            <GroupMembers 
                group={group} 
                avatarSize='large' 
                displayMode='minimal' 
                setGroupEditMode={setGroupEditMode}
                groupEditMode={groupEditMode}
                />

            { renderEditGroup() }

        </div>

        <div className={classes.buttonContainer}>

            { renderBottomButton() }

        </div> 


    </div>
    
    );

}

export default Home;