import classes from './FestivalTile.module.css';

const FestivalTile = ({ festival, pressHandler }) => {

    {/*Formats list of festival as tiles of images. Festival images are added and edited through admin interface and stored in Google Firebase storage*/}

    if (!festival) return;

    return (

        <div 
            className={classes.imgHolder} 
            onClick={()=>pressHandler(festival)}
            >

            <img
                className={classes.img} 
                src={ festival.image?.src}
                alt={ festival.name }
                title={ festival.name }
                />
        
        </div>
        
    );
  };
  
  export default FestivalTile;