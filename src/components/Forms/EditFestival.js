import React, { useState, useRef } from 'react';

import Button from '../UI/Button';
import classes from './Forms.module.css';
import { LOCATIONS } from '../../config';
import icon_info from '../../assets/icons/icon_info.png';
import icon_right from '../../assets/icons/icon_right.png';

import Modal from '../Modals/Modal';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const EditFestival = ( { festival, pressHandler, groupId } ) => {

    const nameRef=useRef();
    const locationRef=useRef();
    const startRef=useRef();
    const endRef=useRef();
    const [showForm, setShowForm] = useState(false);
    const locations = LOCATIONS.sort((a, b) => a.city.localeCompare(b.city));

    const cancelSaveHandler =  () => {
        setShowForm (false);
      };

    const toggleForm = () => {
      setShowForm (!showForm);
      };
      

    const submitHandler = (event) =>{
      //submit form, prevent default form functionality
      event.preventDefault();
      //form validation
      if (nameRef.current.value === '' || locationRef.current.value === '0' || startRef.current.value==='' || endRef.current.value==='') {
        alert("Please tell us more about where you're going!"); return false;
      }
      //check end date is before start date
      if (new Date(endRef.current.value) < new Date(startRef.current.value)) {
        alert("Make sure the event ends after it starts!"); return false;
      }
      setShowForm (false);
      const updatedFestival = {
        custom: true,
        name: nameRef.current.value,
        location: locationRef.current.value,
        startdate: startRef.current.value,
        enddate: endRef.current.value,
      }
      pressHandler(updatedFestival)
    }

    return (
        <div className={classes.container}>

            {!festival && 
                <div className={classes.addEventContainer}>
                  <Button className='noStyle' onClick={toggleForm}>
                  <div className={classes.addEventButtonLabel}>Create my own event</div>
                  {!showForm && 
                    <AddCircleIcon 
                      className={classes.addEventButtonIcon}
                      style={{ fontSize: 60 }} 
                      />

                  }
                </Button>
                </div>
            }

            {festival && !showForm && 
                <div className={classes.editEventContainer}>
                  <Button className='flex' onClick={toggleForm}>
                    <div className={classes.settings_button}>
                    <div className={classes.settings_buttonIconHolder}>
                      <img src={icon_info}  alt='edit' className={classes.settings_buttonIcon}  />
                    </div>
                    <div className={classes.settings_buttonText}>Edit event</div>
                    <img src={icon_right}  alt='go' className={classes.settings_buttonArrow}  />
                </div>
                </Button>
                </div>
            }

            {showForm && 
              <Modal 
              align='top' 
              back 
              title={festival ? 'Edit event' : 'Create event'}
              onConfirm={submitHandler}
              onCancel={cancelSaveHandler}
              >
          
                <form id={groupId}>
                    
                    <input 
                    className={classes.formInput}
                    id='name'
                    required 
                    placeholder='Event Name*'
                    defaultValue={festival?.name} 
                    ref={nameRef}  
                    />

                    <select 
                      id='location' 
                      className={classes.formInput} 
                      required 
                      ref={locationRef} 
                      defaultValue={festival?.location} 
                      >
                      <option value={0}>Select location*</option>
                        {locations.map( (location, index ) => (
                          <option 
                          key={index} 
                          value={location.city} 
                          >
                            {location.city}
                          </option>
                        ))}
                    </select>

                    <input 
                    id='startdate' 
                    className={classes.formInput}
                    type='date'
                    required 
                    data-placeholder='Start Date*' 
                    defaultValue={festival?.startdate} 
                    ref={startRef}  
                    />  

                    <input 
                    id='enddate' 
                    className={classes.formInput}
                    type='date'
                    required 
                    data-placeholder='End Date*' 
                    defaultValue={festival?.enddate} 
                    ref={endRef}  
                    />  

                </form>

              </Modal>
            }   

            

           
        </div>
    );

}

export default EditFestival;