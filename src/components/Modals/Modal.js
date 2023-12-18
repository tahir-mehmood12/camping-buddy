import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import Button from '../UI/Button';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import classes from './Modal.module.css';

//accessibility
//using portals to move backdrop content outside the content root element
const Backdrop = ({onConfirm, style}) =>{
  return(
    <div 
    className={classes.backdrop} 
    style={style}
    onClick={onConfirm} 
    />
  )
}

//using portals to move overlay content outside the content root element
const ModalOverlay = ({ onConfirm, onCancel, back, align, title, children, style, hideHeader, veryTop }) => {

  return(

    <div className = {`${ classes.modal } ${veryTop && classes.veryTop }`}>

      <div className = { classes.modalContent } >

      {!hideHeader &&  <div className = { classes.header }>

        <div className = { classes.headerContainer }>

            <div className= { classes.headerLeft }>
              {
                back &&
                <ArrowBackIosIcon 
                  className={ classes.cursorPointer}  
                  style={{ fontSize: 30, marginRight:5 }} 
                  onClick={ onCancel }
                  />
              }
            </div>

            <div className= { classes.headerCenter }>
              {title}
            </div>

        </div>

      </div>}

      <div className = { classes.content } >

      <div className={`${classes.contentText} ${align === "top" && classes.contentTextTop}`}>

        {children}

        </div>
        
      </div>

      <div className={classes.footer}>

        <div className={classes.footerContent}>

          <Button 
            className='primary' 
            onClick={onConfirm}
            >
            OK
            </Button>

        </div>

      </div>

      </div>

    </div>


   
  )
}

const Modal = ( { onConfirm, onCancel, title, back, align, message, children, bgstyle, style, hideHeader, veryTop} ) => {
  return (
    <Fragment>
      
      {ReactDOM.createPortal(
        <Backdrop 
        onConfirm={onConfirm}
        style={bgstyle}
        />, 
        document.getElementById('root-backdrop')
      )}

      {ReactDOM.createPortal(
        <ModalOverlay 
        title={title} 
        back={back} 
        align={align} 
        children={children} 
        onConfirm={onConfirm} 
        onCancel={onCancel} 
        style={style}
        hideHeader={hideHeader}
        veryTop
        />, 
        document.getElementById('root-overlay')
      )}
    </Fragment>
  );
};

export default Modal;
