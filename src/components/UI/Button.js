import React, { useCallback } from 'react';
import classes from './Button.module.css';

const Button = ({ children, onClick, type, className, borderless, noStyle, primary, style }) => {

  const _className = className ? classes[className] : classes.default;
  const _type = type ? type : 'button';
    
    return (
      <button 
        type={_type} 
        onClick={onClick} 
        className={_className}
        style={style}
        >
        {children}
      </button>
    );
  };
  
  export default Button;
