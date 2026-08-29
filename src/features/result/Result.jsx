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

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function kmhToMph(kmh) {
  return kmh * 0.621371;
}

function mmToInches(mm) {
  return mm * 0.0393701;
}

export default function Result({ location, locationLoading, units }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [place, setPlace] = useState(null);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [day, setDay] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!location) return;

    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);

      try {
        const { latitude, longitude } = location;

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
        setStatus(
          getWeatherCondition(weatherData.current.weather_code),
        );
        setDay(getWordDay(weatherData.current.time, "long"));

        try {
          const placeData = await getPlaceDetails(
            latitude,
            longitude,
          );

          setPlace(placeData);
        } catch {
          setPlace(null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
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

  const forecast = useMemo(() => {
    if (!data?.daily?.time) return [];

    return data.daily.time.map((dateValue, index) => ({
      day: dateValue,
      weatherCode: data.daily.weather_code[index],
      max: data.daily.temperature_2m_max[index],
      min: data.daily.temperature_2m_min[index],
    }));
  }, [data]);

  const hourly = useMemo(() => {
    if (!data?.hourly?.time) return [];

    return data.hourly.time.map((time, index) => ({
      time,
      weatherCode: data.hourly.weather_code[index],
      temperature: data.hourly.temperature_2m[index],
    }));
  }, [data]);

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

  const locationName =
    place?.city ||
    place?.locality ||
    place?.principalSubdivision ||
    "Your Location";

  const temperature = data
    ? Math.round(
        units.temperature === "fahrenheit"
          ? celsiusToFahrenheit(data.current.temperature_2m)
          : data.current.temperature_2m,
      )
    : 0;

  const feelsLike = data
    ? Math.round(
        units.temperature === "fahrenheit"
          ? celsiusToFahrenheit(
              data.current.apparent_temperature,
            )
          : data.current.apparent_temperature,
      )
    : 0;

  const wind = data
    ? Math.round(
        units.windSpeed === "mph"
          ? kmhToMph(data.current.wind_speed_10m)
          : data.current.wind_speed_10m,
      )
    : 0;

  const precipitation = data
    ? units.precipitation === "inch"
      ? mmToInches(data.current.precipitation).toFixed(2)
      : data.current.precipitation
    : 0;

  if (locationLoading) {
    return (
      <main className="w-full max-w-[1100px] mx-auto mt-8">
        <div className="h-44 rounded-xl bg-[#25253f] flex flex-col items-center justify-center">
          <img
            src={loadingIcon}
            alt="Loading"
            className="w-8 animate-spin"
          />
          <p className="text-white mt-3">
            Getting your location...
          </p>
        </div>
      </main>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <main className="w-full max-w-[1100px] mx-auto mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <section className="min-w-0 flex flex-col gap-5">
          <div
            className="w-full h-44 sm:h-48 rounded-xl p-5 bg-cover bg-center flex justify-between items-center overflow-hidden"
            style={{
              backgroundColor: "#25253f",
              backgroundImage: loading
                ? "none"
                : `url(${bg})`,
            }}
          >
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <img
                  src={loadingIcon}
                  alt="Loading"
                  className="w-8 animate-spin"
                />
                <p className="text-white mt-2">
                  Loading...
                </p>
              </div>
            ) : (
              <>
                <div className="text-white min-w-0">
                  <p className="font-semibold text-2xl sm:text-3xl truncate">
                    {locationName}
                  </p>

                  <p className="text-sm text-gray-300 mt-1">
                    {place?.countryName ||
                      place?.country ||
                      "India"}
                  </p>

                  <p className="text-xs font-bold text-gray-300 mt-2">
                    {date}
                  </p>
                </div>

                <div className="flex items-center shrink-0">
                  <img
                    src={
                      weatherIcons[status] ??
                      weatherIcons.overcast
                    }
                    alt={status}
                    className="w-14 sm:w-20"
                  />

                  <p className="text-5xl sm:text-7xl text-white">
                    {temperature}°
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#25253f] h-24 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
              <p className="text-sm font-bold">
                Feels Like
              </p>

              <p className="text-2xl">
                {loading ? "—" : `${feelsLike}°`}
              </p>
            </div>

            <div className="bg-[#25253f] h-24 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
              <p className="text-sm font-bold">
                Humidity
              </p>

              <p className="text-2xl">
                {loading
                  ? "—"
                  : `${Math.round(
                      data.current.relative_humidity_2m,
                    )}%`}
              </p>
            </div>

            <div className="bg-[#25253f] h-24 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
              <p className="text-sm font-bold">
                Wind
              </p>

              <p className="text-2xl">
                {loading
                  ? "—"
                  : `${wind} ${
                      units.windSpeed === "mph"
                        ? "mph"
                        : "km/h"
                    }`}
              </p>
            </div>

            <div className="bg-[#25253f] h-24 rounded-md flex flex-col justify-center p-4 gap-2 text-white">
              <p className="text-sm font-bold">
                Precipitation
              </p>

              <p className="text-2xl">
                {loading
                  ? "—"
                  : `${precipitation} ${
                      units.precipitation === "inch"
                        ? "in"
                        : "mm"
                    }`}
              </p>
            </div>
          </div>

          <section className="text-white">
            <p className="mb-3 font-medium">
              Daily forecast
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {loading
                ? Array.from({ length: 7 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-30 bg-[#25253f] rounded-lg animate-pulse"
                      />
                    ),
                  )
                : forecast
                    .slice(0, 7)
                    .map((item) => {
                      const weatherCondition =
                        getWeatherCondition(
                          item.weatherCode,
                        );

                      return (
                        <div
                          key={item.day}
                          className="h-30 bg-[#25253f] rounded-lg flex flex-col justify-center items-center p-2"
                        >
                          <p className="text-sm">
                            {getWordDay(
                              item.day,
                              "short",
                            )}
                          </p>

                          <img
                            src={
                              weatherIcons[
                                weatherCondition
                              ] ??
                              weatherIcons.overcast
                            }
                            alt={weatherCondition}
                            className="w-9"
                          />

                          <div className="flex gap-3">
                            <p>
                              {Math.round(
                                units.temperature ===
                                  "fahrenheit"
                                  ? celsiusToFahrenheit(
                                      item.max,
                                    )
                                  : item.max,
                              )}
                              °
                            </p>

                            <p className="text-gray-400">
                              {Math.round(
                                units.temperature ===
                                  "fahrenheit"
                                  ? celsiusToFahrenheit(
                                      item.min,
                                    )
                                  : item.min,
                              )}
                              °
                            </p>
                          </div>
                        </div>
                      );
                    })}
            </div>
          </section>
        </section>

        <aside className="bg-[#25253f] rounded-lg text-white h-[430px] overflow-hidden">
          <div className="flex justify-between p-3 items-center">
            <p className="text-sm font-medium">
              Hourly forecast
            </p>

            <button
              type="button"
              onClick={() =>
                setShow((previous) => !previous)
              }
              aria-expanded={show}
              className="h-8 px-2 flex justify-center items-center gap-1 cursor-pointer border border-[#ffffff17] rounded-sm relative text-xs"
            >
              <span>{day || "Select day"}</span>

              <img
                src={dropIcon}
                alt=""
                className={`w-3 transition-transform ${
                  show ? "rotate-180" : ""
                }`}
              />

              {show && (
                <div className="absolute w-40 bg-[#25253f] right-0 top-10 border border-[#ffffff17] rounded-md p-2 z-50">
                  {Object.keys(groupedHourly).map(
                    (item) => (
                      <span
                        key={item}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setDay(item);
                          setShow(false);
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " "
                          ) {
                            setDay(item);
                            setShow(false);
                          }
                        }}
                        className="block w-full text-left px-2 py-2 hover:bg-[#2f2f49] rounded-sm cursor-pointer"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              )}
            </button>
          </div>

          {loading ? (
            <div className="p-3 flex flex-col gap-2">
              {Array.from({ length: 7 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-12 bg-[#2f2f49] rounded-md animate-pulse"
                  />
                ),
              )}
            </div>
          ) : (
            <div
              className="
                h-[370px]
                p-3
                flex
                flex-col
                gap-2
                overflow-y-auto
                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-track]:bg-[#25253f]
                [&::-webkit-scrollbar-thumb]:bg-[#55556f]
                [&::-webkit-scrollbar-thumb]:rounded-full
              "
            >
              {selectedHourly.map((item) => (
                <div
                  key={item.time}
                  className="flex justify-between w-full min-h-12 bg-[#2f2f49] rounded-md p-2 items-center shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        weatherIcons[
                          getWeatherCondition(
                            item.weatherCode,
                          )
                        ] ?? weatherIcons.overcast
                      }
                      alt=""
                      className="w-7"
                    />

                    <p className="text-sm">
                      {new Date(
                        item.time,
                      ).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <p>
                    {Math.round(
                      units.temperature ===
                        "fahrenheit"
                        ? celsiusToFahrenheit(
                            item.temperature,
                          )
                        : item.temperature,
                    )}
                    °
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
