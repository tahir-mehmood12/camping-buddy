import React, { useState } from 'react';

import { useParams } from 'react-router-dom'

const Share = props => {

    const params = useParams();

    return (
    <>
    <p>Share</p>
    <p>{params.groupId}</p>
    <p>{params.memberId}</p>
     </>

    );

}

export default Share;