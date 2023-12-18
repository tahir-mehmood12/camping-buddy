import classes from './Subheading.module.css';

const Subheading = ({ children }) => {
    
    return (
      <h2 className={classes.heading}>{children}</h2>
    );
  };
  
  export default Subheading;