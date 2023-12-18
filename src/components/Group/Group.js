import React, { useState, useEffect } from 'react';

import classes from './Group.module.css';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';
import parse from 'html-react-parser';

import Modal from "../Modals/Modal";

const Group = ( { group, onConfirm} ) => {
    
    return (

        <Modal 
            align='top' 
            back 
            title={group?.name}
            onConfirm={()=>onConfirm(false)}
            onCancel={()=>onConfirm(false)}
            >
        
           <p>Edit group</p>

        </Modal>


    );

}

export default Group;