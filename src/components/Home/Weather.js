import React, { useState, useEffect} from 'react';

import classes from './Weather.module.css';

import FestivalDate from './FestivalDate';

const Weather = ({ festival, setDaysToGo } ) => {

  const [weatherDates, setWeatherDates] = useState([]);

  //console.log('today',todayDate, 'start',startDate, 'end',endDate,'days to go',daysToGo);

  const setWeatherIcons = () => {
    
    //work out dates
    const today = new Date(); 
    const start = new Date(festival.startdate); 
    const end = new Date(festival.enddate); 
    const timeLeft = start.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 3600 * 24)); setDaysToGo(daysLeft);

    setWeatherDates([]);

    //Only show weather data 3 days out from start of festival
    if (daysLeft > 3) return false;

    //to make dates inclusive add one
    const festivalNumberDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) +1; 
   
    const weatherDatesArray = [];
    for (let i=0; i<festivalNumberDays; i++){
      const festivalDateItem={};
      festivalDateItem.forecast=null;
      if (i===0){
        festivalDateItem.date=start;//start date
      } else if (i===(festivalNumberDays-1)){
        festivalDateItem.date=end;//finish date
      } else {
        festivalDateItem.date=new Date(start.getTime()+(1000 * 3600 * 24 *i));
        //get date for dates in between
      }
      //add to weather dates array if the festival date is not in the past
      const timeBetweenTodayAndDate = festivalDateItem.date.getTime() - today.getTime();
      const daysLeftBetweenTodayAndDate = Math.ceil(timeBetweenTodayAndDate / (1000 * 3600 * 24));
      if (daysLeftBetweenTodayAndDate>0) weatherDatesArray.push(festivalDateItem);
    }
    
    setWeatherDates(weatherDatesArray);
  }

  useEffect(() => {
    if (!festival) return;
    setWeatherIcons();
  }, [festival]);

  if ( weatherDates && weatherDates.length === 0 ) {
    return <></>
  }

  return (
    <div className={classes.weatherContainer}>

      {weatherDates?.map( ( d, index ) => (
        
        <FestivalDate 
          key={index} 
          index={index} 
          date={d.date} 
          festival={festival} 
          />
      ))}

    </div>
  )

}
export default Weather;
