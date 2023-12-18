import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import Button from '../UI/Button';

import classes from './Alert.module.css';
import parse from 'html-react-parser';

//accessibility
//using portals to move backdrop content outside the content root element
const AlertBackdrop = ({onConfirm}) =>{
  return(
    <div className={classes.backdrop} onClick={onConfirm} />
  )
}

//using portals to move overlay content outside the content root element
const AlertModalOverlay = ({ onConfirm, title, message, onCancel }) => {

  return(


    <div className = { classes.alert }>

      <div className = { classes.alertContent } >

      <div className= { classes.alertHeader }>  {title}  </div>

      <div className={classes.alertText}>

        {message && parse(message)}
        
      </div>

      <div className={classes.alertFooter}>

        {onCancel && 
          <Button 
                className='cancel' 
                onClick={onCancel}
                >
              Cancel
            </Button>
          }

          <Button 
            className='primary' 
            onClick={onConfirm}
            >
            OK
            </Button>

            


      </div>

      </div>

    </div>



   
  )
}

const Alert = ( { onConfirm, title,  message, onCancel  } ) => {
  return (
    <Fragment>
      
      {ReactDOM.createPortal(
        <AlertBackdrop 
        onConfirm={onConfirm}
        />, 
        document.getElementById('root-backdrop')
      )}

      {ReactDOM.createPortal(
        <AlertModalOverlay 
        title={title} 
        onConfirm={onConfirm} 
        onCancel={onCancel}
        message={message} 
        />, 
        document.getElementById('root-overlay')
      )}
    </Fragment>
  );
};

export default Alert;
