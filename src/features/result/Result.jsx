import sunny from "../../assets/images/icon-sunny.webp";
import bg from "../../assets/images/bg-today-large.svg";
import dropIcon from "../../assets/images/icon-dropdown.svg";
import storm from "../../assets/images/icon-storm.webp";
import drizzle from "../../assets/images/icon-drizzle.webp";
import fog from "../../assets/images/icon-fog.webp";
import overcast from "../../assets/images/icon-overcast.webp";
import partlyCloudy from "../../assets/images/icon-partly-cloudy.webp";
import rain from "../../assets/images/icon-rain.webp";
import snow from "../../assets/images/icon-snow.webp";
import loadingIcon from "../../assets/images/icon-loading.svg";

import { useEffect, useMemo, useState } from "react";

import {
  getDate,
  getPlaceDetails,
  getWeatherCondition,
  getWordDay,
} from "../helper/helper";

const weatherIcons = {
  sunny,
  partlycloudy: partlyCloudy,
  overcast,
  fog,
  drizzle,
  rain,
  snow,
  storm,
};

// CONVERSIONS

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

function mmToInches(mm) {
  return mm * 0.0393701;
}

// RESULT

export default function Result({ location, locationLoading, units }) {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(null);

  const [place, setPlace] = useState(null);

  const [date, setDate] = useState("");

  const [status, setStatus] = useState("");

  const [day, setDay] = useState("");

  const [show, setShow] = useState(false);

  // FETCH WEATHER

  useEffect(() => {
    if (!location) {
      return;
    }

    const controller = new AbortController();

    async function fetchWeather() {
      try {
        setLoading(true);

        const { latitude, longitude } = location;

        console.log("Fetching weather:", latitude, longitude);

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error("Weather API failed");
        }

        const weatherData = await res.json();

        setData(weatherData);

        setDate(getDate(weatherData.current.time));

        setStatus(getWeatherCondition(weatherData.current.weather_code));

        setDay(getWordDay(weatherData.current.time, "long"));

        // Reverse geocoding

        try {
          const placeData = await getPlaceDetails(latitude, longitude);

          setPlace(placeData);
        } catch (error) {
          console.log("Place error:", error);

          setPlace(null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log("Weather error:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      controller.abort();
    };
  }, [location]);

  // DAILY DATA

  const forecast = useMemo(() => {
    if (!data?.daily?.time) {
      return [];
    }

    return data.daily.time.map((dateValue, index) => ({
      day: dateValue,

      weatherCode: data.daily.weather_code[index],

      max: data.daily.temperature_2m_max[index],

      min: data.daily.temperature_2m_min[index],
    }));
  }, [data]);

  // HOURLY DATA

  const hourly = useMemo(() => {
    if (!data?.hourly?.time) {
      return [];
    }

    return data.hourly.time.map((time, index) => ({
      time,

      weatherCode: data.hourly.weather_code[index],

      temperature: data.hourly.temperature_2m[index],
    }));
  }, [data]);

  // GROUP HOURLY

  const groupedHourly = useMemo(() => {
    const grouped = {};

    hourly.forEach((item) => {
      const weekday = getWordDay(item.time, "long");

      if (!grouped[weekday]) {
        grouped[weekday] = [];
      }

      grouped[weekday].push(item);
    });

    return grouped;
  }, [hourly]);

  const selectedHourly = groupedHourly[day] || [];

  // LOCATION NAME

  const locationName =
    place?.city ||
    place?.locality ||
    place?.principalSubdivision ||
    "Your Location";

  // INITIAL LOCATION LOADING

  if (locationLoading) {
    return (
      <div className="w-full max-w-6xl mt-7">
        <div className="w-full h-44 bg-[#25253f] rounded-xl flex flex-col justify-center items-center">
          <img src={loadingIcon} alt="loading" className="w-8 animate-spin" />

          <p className="text-white mt-3">Getting your location...</p>
        </div>
      </div>
    );
  }

  // MAIN UI

  return (
    <div className="w-full max-w-6xl mt-7 flex gap-5 justify-center flex-wrap">
      {/* 
          LEFT SIDE
      */}

      <div className="w-full max-w-200 flex flex-col gap-5">
        {/* CURRENT WEATHER */}

        <div
          className="w-full h-44 rounded-xl p-5 bg-no-repeat bg-cover flex justify-between items-center"
          style={{
            backgroundColor: "#25253f",

            backgroundImage: loading ? "none" : `url(${bg})`,
          }}
        >
          {loading ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <img
                src={loadingIcon}
                alt="loading"
                className="w-8 animate-spin"
              />

              <p className="text-white mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {/* LOCATION */}

              <div className="text-white">
                <p className="font-semibold text-2xl">{locationName}</p>

                <p className="text-xs font-bold text-gray-300 mt-1">{date}</p>
              </div>

              {/* TEMPERATURE */}

              <div className="flex items-center">
                <img src={weatherIcons[status]} alt={status} className="w-20" />

                <p className="text-7xl text-white">
                  {Math.round(
                    units.temperature === "fahrenheit"
                      ? celsiusToFahrenheit(data.current.temperature_2m)
                      : data.current.temperature_2m,
                  )}
                  °
                </p>
              </div>
            </>
          )}
        </div>

        {/* 
            DETAILS
        */}

        <div className="w-full flex gap-3 flex-wrap">
          {/* FEELS LIKE */}

          <div className="bg-[#25253f] h-24 flex-1 min-w-35 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
            <p className="text-sm font-bold">Feels Like</p>

            <p className="text-2xl">
              {loading
                ? "—"
                : Math.round(
                    units.temperature === "fahrenheit"
                      ? celsiusToFahrenheit(data.current.apparent_temperature)
                      : data.current.apparent_temperature,
                  ) + "°"}
            </p>
          </div>

          {/* HUMIDITY */}

          <div className="bg-[#25253f] h-24 flex-1 min-w-35 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
            <p className="text-sm font-bold">Humidity</p>

            <p className="text-2xl">
              {loading
                ? "—"
                : `${Math.round(data.current.relative_humidity_2m)}%`}
            </p>
          </div>

          {/* WIND */}

          <div className="bg-[#25253f] h-24 flex-1 min-w-35 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
            <p className="text-sm font-bold">Wind</p>

            <p className="text-2xl">
              {loading
                ? "—"
                : `${Math.round(
                    units.windSpeed === "mph"
                      ? kmhToMph(data.current.wind_speed_10m)
                      : data.current.wind_speed_10m,
                  )} ${units.windSpeed === "mph" ? "mph" : "km/h"}`}
            </p>
          </div>

          {/* PRECIPITATION */}

          <div className="bg-[#25253f] h-24 flex-1 min-w-35 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
            <p className="text-sm font-bold">Precipitation</p>

            <p className="text-2xl">
              {loading
                ? "—"
                : `${
                    units.precipitation === "inch"
                      ? mmToInches(data.current.precipitation).toFixed(2)
                      : data.current.precipitation
                  } ${units.precipitation === "inch" ? "in" : "mm"}`}
            </p>
          </div>
        </div>

        {/* 
            DAILY FORECAST
        */}

        <div className="text-white">
          <p className="mb-3">Daily forecast</p>

          <div className="w-full flex gap-3 flex-wrap">
            {loading
              ? Array.from({
                  length: 7,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-30 bg-[#25253f] w-22 rounded-lg animate-pulse"
                  />
                ))
              : forecast.slice(0, 7).map((item) => (
                  <div
                    key={item.day}
                    className="h-30 bg-[#25253f] w-22 rounded-lg flex flex-col justify-center items-center p-2"
                  >
                    <p className="text-sm">{getWordDay(item.day, "short")}</p>

                    <img
                      src={weatherIcons[getWeatherCondition(item.weatherCode)]}
                      alt="weather"
                      className="w-9"
                    />

                    <div className="flex gap-3">
                      <p>
                        {Math.round(
                          units.temperature === "fahrenheit"
                            ? celsiusToFahrenheit(item.max)
                            : item.max,
                        )}
                        °
                      </p>

                      <p className="text-gray-400">
                        {Math.round(
                          units.temperature === "fahrenheit"
                            ? celsiusToFahrenheit(item.min)
                            : item.min,
                        )}
                        °
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/*HOURLY FORECAST*/}

      <div className="bg-[#25253f] rounded-lg text-white w-full max-w-60 h-107">
        {/* HEADER */}
        <div className="flex justify-between p-3 items-center">
          <p className="text-sm">Hourly forecast</p>
          <div
            className="h-8 px-2 flex justify-center items-center gap-1 cursor-pointer border border-[#ffffff17] rounded-sm relative text-xs"
            onClick={() => setShow((previous) => !previous)}
          >
            <p>{day || "Select day"}</p>
            <img
              src={dropIcon}
              alt="dropdown"
              className={`w-3 ${show ? "rotate-180" : ""}`}
            />

            {show && (
              <div className="absolute w-40 bg-[#25253f] right-0 top-10 border border-[#ffffff17] rounded-md p-2 z-50">
                {Object.keys(groupedHourly).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      setDay(item);
                      setShow(false);
                    }}
                    className="w-full text-left px-2 py-2 hover:bg-[#2f2f49] rounded-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HOURLY */}

        {loading ? (
          <div className="p-3 flex flex-col gap-2">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className="h-12 bg-[#2f2f49] rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className="p-3 flex flex-col gap-2 overflow-y-auto  [&::-webkit-scrollbar]:w-0.75
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-[#55556f]
    [&::-webkit-scrollbar-thumb]:rounded-full h-90"
          >
            {selectedHourly.map((item) => (
              <div
                key={item.time}
                className="flex justify-between w-full h-12 bg-[#2f2f49] rounded-md p-2 items-center"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={weatherIcons[getWeatherCondition(item.weatherCode)]}
                    alt="weather"
                    className="w-7"
                  />

                  <p className="text-sm">
                    {new Date(item.time).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <p>
                  {Math.round(
                    units.temperature === "fahrenheit"
                      ? celsiusToFahrenheit(item.temperature)
                      : item.temperature,
                  )}
                  °
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
