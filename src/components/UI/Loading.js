import React, { useCallback } from 'react';
import classes from './Loading.module.css';

const Loading = ({ msg }) => {
    
    return (
      <div className='container bg'>
        <p className={classes.text}>{msg}</p>
      </div>
    );
  };
  
  export default Loading;