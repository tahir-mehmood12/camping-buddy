import React, { useState} from 'react';

import weather_coming from '../../assets/weather/coming.png';
import weather_rain from '../../assets/weather/rain.png';
import weather_cloud from '../../assets/weather/cloud.png';
import weather_cold from '../../assets/weather/cold.png';
import weather_hot from '../../assets/weather/hot.png';
import weather_storm from '../../assets/weather/storm.png';
import weather_sun from '../../assets/weather/sun.png';
import weather_suncloud from '../../assets/weather/suncloud.png';
import weather_wind from '../../assets/weather/wind.png';
import Alert from '../Modals/Alert';
import classes from './WeatherIcon.module.css';
import Button from '../UI/Button';
import { WEATHERTIPS } from '../../config';

const FestivalWeather = ( { forecast, festival }) => {

  const [showWeatherInfo, setShowWeatherInfo]=useState(false);
  
  const toggleWeatherInfoHandler = ()=>{ setShowWeatherInfo(!showWeatherInfo); };

  const weatherTip = WEATHERTIPS.find( tip => tip.id === forecast);
  
  let weather_image=null;

  switch (forecast){
    case "rain":weather_image=weather_rain; break;
    case "cloud":weather_image=weather_cloud; break;
    case "cold":weather_image=weather_cold; break;
    case "hot":weather_image=weather_hot; break;
    case "storm":weather_image=weather_storm; break;
    case "sun":weather_image=weather_sun; break;
    case "suncloud":weather_image=weather_suncloud; break;
    case "wind":weather_image=weather_wind; break;
    default: weather_image=weather_coming;
  }

  return(
    <>
    
    <Button 
      className='noStyle'
      onClick={toggleWeatherInfoHandler}
      >

      {<img 
      src={weather_image} 
      alt={forecast} 
      className={classes.weatherIconImage}
      />}

      </Button>
    
      {showWeatherInfo && weatherTip &&

        <Alert 
        title={weatherTip.title}
        message={weatherTip.tip}
        onConfirm={toggleWeatherInfoHandler}
        />

      }

    </>
  )
}
export default FestivalWeather;
