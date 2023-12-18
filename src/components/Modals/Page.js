import React, { useState, useEffect } from 'react';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';

import Modal from "./Modal";
import parse from 'html-react-parser';

const Page = ( { setShowPage, id} ) => {

    const [pageContent, setPageContent] = useState();

    const getPage = async (id) => {
        const docRef = doc(db, "pages", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setPageContent(docSnap.data());
        } else {
            console.log("can't get page content", id);
        }
    }

    useEffect(() => {
        setPageContent();
        //get page info
        if (!id) return;
        getPage(id);
        return () => {
            setPageContent();
        };
      }, [id])

      if (!pageContent) return (
        <></>
      )

    
    return (

        <Modal 
            align='top' 
            back 
            title={pageContent.title} 
            onConfirm={()=>setShowPage(false)}
            onCancel={()=>setShowPage(false)}
            >
        
            {pageContent.text && parse(pageContent.text)} 

        </Modal>

    );

}

export default Page ;