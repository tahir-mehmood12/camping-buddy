import classes from './Avatar.module.css';

import avatar1 from '../../assets/avatars/circlekangaroo.png';
import avatar2 from '../../assets/avatars/circlewombat.png';
import avatar3 from '../../assets/avatars/circlelizard.png';
import avatar4 from '../../assets/avatars/circlecod.png';
import avatar5 from '../../assets/avatars/circlepossum.png';
import avatar6 from '../../assets/avatars/circlequokka.png';
import avatar7 from '../../assets/avatars/circletassiedevil.png';
import avatar8 from '../../assets/avatars/circlegalah.png';
import avatar9 from '../../assets/avatars/circlekoala.png';


const Avatar = ({ member, showName, selectedAvatar, avatar, avatarSize, style, isSelected, setSelected } ) => {

const avatarId = member ? member.avatar : avatar?.id ? Number(avatar.id) : null;
const avatarName = member ? member.name : avatar?.name ? avatar.name : null ;

//console.log('avatarId',avatarId,'selectedAvatar',selectedAvatar);

let imgSizeClass;
  switch (avatarSize){
    case 'small': imgSizeClass = classes.imgSmall; break;
    case 'medium': imgSizeClass = classes.imgMedium; break;
    case 'large': imgSizeClass = classes.imgLarge; break;
    case 'huge': imgSizeClass = classes.imgHuge; break;
    default: imgSizeClass = classes.imgMedium;
  }

let image;
  switch (avatarId){
    case 1: image=avatar1; break;
    case 2: image=avatar2; break;
    case 3: image=avatar3; break;
    case 4: image=avatar4; break;
    case 5: image=avatar5; break;
    case 6: image=avatar6; break;
    case 7: image=avatar7; break;
    case 8: image=avatar8; break;
    case 9: image=avatar9; break;
    default: image=null;
  }

    if (!avatarId) return;
    
    return (

        <div 
          className={classes.avatarContainer} 
          style={style}
          onClick={setSelected}
          >

                { image && <img 
                    src={image}
                    className={`
                      ${classes.img} 
                      ${imgSizeClass} 
                      ${selectedAvatar && (avatarId === selectedAvatar) && classes.selectedImg}
                      ${isSelected && classes.selectedImg}
                    `}
                    alt=''
                    />
                }
                    
                { showName && 
                  <div 
                    className={`
                      ${classes.text} 
                      ${selectedAvatar && (avatarId === selectedAvatar) && classes.selectedText}
                      ${isSelected && classes.selectedText}
                    `}
                    >
                    { showName === 'long' ? avatarName : avatarName?.substr(0,3) }
                  </div>
                }
           

        </div>

    );

}

export default Avatar;