import classes from './Tab.module.css';

import Subheading from '../UI/Subheading';


const Tab = ({ title, children, closeHandler }) => {

  return(

    <div className={classes.tabBg}>

            <div className={classes.tabTopSpace} onClick={closeHandler} >&nbsp;</div>
            
            <div className={classes.tabContainer}>

            <div className={classes.tabTopStripeContainer}>
                <div className={classes.tabTopStripe}>&nbsp;</div>
            </div>

            <Subheading>{title}</Subheading>

            { children }

            </div>
       </div>

   
  )
}

export default Tab;
