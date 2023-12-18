import React, { useState, useEffect } from 'react';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';
import parse from 'html-react-parser';

import Modal from "../Modals/Modal";

const FestivalInfo = ( { id, onConfirm, onCancel } ) => {

    const [festival, setFestival] = useState();

    const getFestival = async (id) => {
        const docRef = doc(db, "festivals", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setFestival(docSnap.data());
        } else {
            console.log("can't get info");
        }
    }

    useEffect(() => {
        //get festival info
        setFestival();
        if (!id) return;
        getFestival(id);
        return () => {
            setFestival();
        };
      }, [id])

      if (!festival) return (
        <></>
      )

    
    return (

        <Modal 
            align='top' 
            back 
            title={festival.name}
            onConfirm={()=>onConfirm(false)}
            onCancel={()=>onCancel(false)}
            >
        
            { festival.info && parse(festival.info)} 

        </Modal>


    );

}

export default FestivalInfo;