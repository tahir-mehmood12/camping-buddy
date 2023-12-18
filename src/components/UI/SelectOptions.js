import React, { useState } from 'react';
import classes from './SelectOptions.module.css';
import DescriptionIcon from '@mui/icons-material/Description';
import icon_sort from '../../assets/icons/icon_sort.png';
import icon_share from '../../assets/icons/icon_share.png';
import AddIcon from '@mui/icons-material/Add';
import Button from './Button';

const SelectOptions = ({ title, icon, options, selectedOption, setSelectedOption}) => {

  const [showOptions, setShowOptions] = useState(false);

  let _icon = null;
  switch (icon) {
    case 'sort': _icon =  <div className='actionButton'><img src={icon_sort}  alt='Sort'  className={classes.icon_sort} /></div>; break;
    case 'share': _icon =  <div className='actionButton'><img src={icon_share}  alt='Share'  className={classes.icon_share} /></div>; break;
    case 'add': _icon =  <div className='actionButton'><AddIcon  style={{ fontSize: 30 }}/></div>; break;
    default: _icon =  <DescriptionIcon  style={{ fontSize: 30 }}/>;
  }

  const optionChangeHandler = (id) => {
    setShowOptions(false);
    setSelectedOption(id);
  }

  const renderOptions = () => {
    return (
      <>
      <div className={classes.optionsBgContainer}  onClick={()=>setShowOptions(!showOptions)}></div>
      <div className={classes.optionsContainer}>
            <div className={classes.optionsHeaderContainer}>
              <Button className='flex' onClick={()=>setShowOptions(!showOptions)}>
                <div className={classes.optionsHeaderText}>{title}</div>
              </Button>
            </div>
            <div className={classes.optionsHolder}>
              {options?.map( option => (
                <Button key={option.id} className='flex' onClick={()=>optionChangeHandler(option.id)}>
                  <div className={`${classes.option} ${(selectedOption === option.id) && classes.selectedOption}`}>
                  {option.title}
                  </div>
                </Button>
              ))}
            </div>
          </div>
      </>
      
    )}
 
    return (
      <div className={classes.selectionContainer}>

          <Button className='noStyle' onClick={()=>setShowOptions(!showOptions)}>
            {_icon}
          </Button>

          { showOptions && renderOptions()}

      </div>
    );
  };
  
  export default SelectOptions;
