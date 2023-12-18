
import classes from './Protip.module.css';

const Protip = ( { itemInfo } ) => {
    
    if ( itemInfo && (itemInfo.general || itemInfo.hiring) ) return(
        <div className={classes.proTipContainer}>
            <div className={classes.proTipHeaderContainer}>
                <div className={classes.proTipHeader}>Pro Tip!</div>
            </div>
            <div className={classes.proTipContent}>{itemInfo.general}</div>
            <div className={classes.proTipSubContent}>{itemInfo.hiring}</div>
        </div>
    )
}

export default Protip;