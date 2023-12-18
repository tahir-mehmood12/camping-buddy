import classes from './Heading.module.css';

const Heading = ({ children }) => {
    
    return (
      <h1 className={classes.heading1}>{children}</h1>
    );
  };
  
  export default Heading;