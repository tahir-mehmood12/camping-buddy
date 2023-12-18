import React, {useState, useEffect} from 'react';
import WeatherIcon from './WeatherIcon';
import {weathercodes} from './Weathercodes';
import classes from './FestivalDate.module.css';

const daysOfTheWeek=["Sun","Mon","Tues","Wed","Thur","Fri","Sat"];


const FestivalDate = ({index, date, festival}) => {

  const dayWeek = daysOfTheWeek[ date.getDay() ];
  const dateMonth = date.toLocaleString(undefined,{day:'2-digit'});
  const month = date.toLocaleString(undefined,{month:'long'});
  const year = date.getFullYear();
  const [forecastIcon, setForecastIcon] = useState();

  const fetchWeather = async () => {
    if (!festival.location) return;
    try {
      const city=festival.location;
      //console.log("fetching weather for "+city+" on "+date);
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=f95e1f28a0fa4c4e89345802213108&q=${city}&days=10&aqi=no&alerts=no`);
      if (!response.ok){
        console.log('Error getting weather data for '+city);
      } else {
        const resData = await response.json();
        const forecast = resData.forecast.forecastday;
        //convert festival date to YY-MM-DD
        const festivalDate = date.toLocaleDateString('en-CA');
        //console.log('forecast',festivalDate );
        //is festival day in forecast data?
        const forecastIndex=forecast.findIndex(day=>day.date===festivalDate);
        //get forecast code and icon from weather codes array
        const forecastCode = (forecastIndex!==-1) ? forecast[forecastIndex].day.condition.code : null;
        if (forecastCode!==null){
          const forecastIcon = weathercodes.find(item => item.code===forecastCode).icon;
          //put into festival Days object array
          setForecastIcon(forecastIcon);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
      fetchWeather();
    }, []);


  if (!festival || !forecastIcon) return;



  return(
    <div className={classes.dateContainer}>

        <WeatherIcon 
          forecast={forecastIcon} 
          index={index} 
          dateMonth={dateMonth} 
          fulldate={date} 
          festival={festival}
          />

        <div className={classes.dateText}>
          {dayWeek}
        </div>

    </div>

  )
}
export default FestivalDate;
