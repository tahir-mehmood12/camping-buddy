import React from 'react';

import classes from './EditMember.module.css';

import EditMemberForm from '../Forms/EditMemberForm';
import Tab from '../Modals/Tab';


const EditMember = ( { group, member, setSelectedMember } ) => {

    if (!member) return;

    return (

        <Tab closeHandler={()=>setSelectedMember()} title='Edit Member'>

             <EditMemberForm member={member} group={group} setSelectedMember={setSelectedMember}/>

        </Tab>

    );

}

export default EditMember;