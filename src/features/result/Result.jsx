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

export default function Result({
  location,
  locationLoading,
  units,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [place, setPlace] = useState(null);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [day, setDay] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!location) {
      return;
    }

    const controller =
      new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError("");

      try {
        const {
          latitude,
          longitude,
        } = location;

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code&timezone=auto`,
          {
            signal:
              controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error(
            "Weather API failed",
          );
        }

        const weatherData =
          await res.json();

        if (controller.signal.aborted) {
          return;
        }

        setData(weatherData);

        setDate(
          getDate(
            weatherData.current.time,
          ),
        );

        setStatus(
          getWeatherCondition(
            weatherData.current
              .weather_code,
          ),
        );

        setDay(
          getWordDay(
            weatherData.current.time,
            "long",
          ),
        );

        try {
          const placeData =
            await getPlaceDetails(
              latitude,
              longitude,
            );

          if (!controller.signal.aborted) {
            setPlace(placeData);
          }
        } catch {
          if (!controller.signal.aborted) {
            setPlace(null);
          }
        }
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          setError(
            "Unable to load weather data. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      controller.abort();
    };
  }, [location]);

  const forecast = useMemo(() => {
    if (!data?.daily?.time) {
      return [];
    }

    return data.daily.time.map(
      (dateValue, index) => ({
        day: dateValue,
        weatherCode:
          data.daily.weather_code[
            index
          ],
        max:
          data.daily
            .temperature_2m_max[index],
        min:
          data.daily
            .temperature_2m_min[index],
      }),
    );
  }, [data]);

  const hourly = useMemo(() => {
    if (!data?.hourly?.time) {
      return [];
    }

    return data.hourly.time.map(
      (time, index) => ({
        time,
        weatherCode:
          data.hourly.weather_code[
            index
          ],
        temperature:
          data.hourly.temperature_2m[
            index
          ],
      }),
    );
  }, [data]);

  const groupedHourly = useMemo(() => {
    const grouped = {};

    hourly.forEach((item) => {
      const weekday = getWordDay(
        item.time,
        "long",
      );

      if (!grouped[weekday]) {
        grouped[weekday] = [];
      }

      grouped[weekday].push(item);
    });

    return grouped;
  }, [hourly]);

  const selectedHourly =
    groupedHourly[day] || [];

  const locationName =
    place?.city ||
    place?.locality ||
    place?.principalSubdivision ||
    "Your Location";

  const locationCountry =
    place?.countryName || "";

  function getIcon(code) {
    const weatherStatus =
      getWeatherCondition(code);

    return (
      weatherIcons[weatherStatus] ||
      overcast
    );
  }

  if (locationLoading) {
    return (
      <div className="mx-auto mt-7 w-full max-w-6xl">
        <div className="flex h-44 w-full flex-col items-center justify-center rounded-xl bg-[#25253f]">
          <img
            src={loadingIcon}
            alt="Loading weather"
            className="w-8 animate-spin"
          />

          <p className="mt-3 text-white">
            Getting your location...
          </p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="mx-auto mt-7 w-full max-w-6xl">
        <div className="flex h-44 w-full items-center justify-center rounded-xl bg-[#25253f]">
          <p className="text-center text-gray-400">
            Search for a city to see the weather.
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto mt-7 w-full max-w-6xl">
        <div className="flex h-44 w-full items-center justify-center rounded-xl bg-[#25253f]">
          <p className="text-center text-red-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-7 grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="flex min-w-0 flex-col gap-5">
        <div
          className="flex min-h-44 w-full items-center justify-between rounded-xl bg-cover bg-no-repeat p-5 md:p-6"
          style={{
            backgroundColor:
              "#25253f",
            backgroundImage: loading
              ? "none"
              : `url(${bg})`,
          }}
        >
          {loading ? (
            <div className="flex h-full w-full flex-col items-center justify-center">
              <img
                src={loadingIcon}
                alt="Loading weather"
                className="w-8 animate-spin"
              />

              <p className="mt-2 text-white">
                Loading...
              </p>
            </div>
          ) : data ? (
            <>
              <div className="text-white">
                <p className="text-xl font-semibold md:text-2xl">
                  {locationName}
                </p>

                {locationCountry && (
                  <p className="mt-1 text-sm text-gray-300">
                    {locationCountry}
                  </p>
                )}

                <p className="mt-1 text-xs font-bold text-gray-300">
                  {date}
                </p>
              </div>

              <div className="flex items-center">
                <img
                  src={getIcon(
                    data.current
                      .weather_code,
                  )}
                  alt={status}
                  className="w-14 md:w-20"
                />

                <p className="text-5xl text-white md:text-7xl">
                  {Math.round(
                    units.temperature ===
                      "fahrenheit"
                      ? celsiusToFahrenheit(
                          data.current
                            .temperature_2m,
                        )
                      : data.current
                          .temperature_2m,
                  )}
                  °
                </p>
              </div>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="flex h-24 flex-col justify-center gap-2 rounded-md bg-[#25253f] p-4 text-white">
            <p className="text-sm font-bold">
              Feels Like
            </p>

            <p className="text-2xl">
              {loading || !data
                ? "—"
                : `${Math.round(
                    units.temperature ===
                      "fahrenheit"
                      ? celsiusToFahrenheit(
                          data.current
                            .apparent_temperature,
                        )
                      : data.current
                          .apparent_temperature,
                  )}°`}
            </p>
          </div>

          <div className="flex h-24 flex-col justify-center gap-2 rounded-md bg-[#25253f] p-4 text-white">
            <p className="text-sm font-bold">
              Humidity
            </p>

            <p className="text-2xl">
              {loading || !data
                ? "—"
                : `${Math.round(
                    data.current
                      .relative_humidity_2m,
                  )}%`}
            </p>
          </div>

          <div className="flex h-24 flex-col justify-center gap-2 rounded-md bg-[#25253f] p-4 text-white">
            <p className="text-sm font-bold">
              Wind
            </p>

            <p className="text-2xl">
              {loading || !data
                ? "—"
                : `${Math.round(
                    units.windSpeed ===
                      "mph"
                      ? kmhToMph(
                          data.current
                            .wind_speed_10m,
                        )
                      : data.current
                          .wind_speed_10m,
                )} ${
                    units.windSpeed ===
                    "mph"
                      ? "mph"
                      : "km/h"
                  }`}
            </p>
          </div>

          <div className="flex h-24 flex-col justify-center gap-2 rounded-md bg-[#25253f] p-4 text-white">
            <p className="text-sm font-bold">
              Precipitation
            </p>

            <p className="text-2xl">
              {loading || !data
                ? "—"
                : `${
                    units.precipitation ===
                    "inch"
                      ? mmToInches(
                          data.current
                            .precipitation,
                        ).toFixed(2)
                      : data.current
                          .precipitation
                  } ${
                    units.precipitation ===
                    "inch"
                      ? "in"
                      : "mm"
                  }`}
            </p>
          </div>
        </div>

        <div className="text-white">
          <p className="mb-3">
            Daily forecast
          </p>

          <div className="flex w-full gap-3 overflow-x-auto pb-2 [scrollbar-color:#55556f_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#55556f]">
            {loading
              ? Array.from({
                  length: 7,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-30 min-w-22 animate-pulse rounded-lg bg-[#25253f]"
                  />
                ))
              : forecast
                  .slice(0, 7)
                  .map((item) => (
                    <div
                      key={item.day}
                      className="flex h-30 min-w-22 flex-col items-center justify-center rounded-lg bg-[#25253f] p-2"
                    >
                      <p className="text-sm">
                        {getWordDay(
                          item.day,
                          "short",
                        )}
                      </p>

                      <img
                        src={getIcon(
                          item.weatherCode,
                        )}
                        alt={getWeatherCondition(
                          item.weatherCode,
                        )}
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
                  ))}
          </div>
        </div>
      </div>

      <div className="h-107 w-full rounded-lg bg-[#25253f] text-white">
        <div className="flex items-center justify-between p-3">
          <p className="text-sm">
            Hourly forecast
          </p>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShow(
                  (previous) =>
                    !previous,
                )
              }
              aria-expanded={show}
              aria-haspopup="listbox"
              className="flex h-8 cursor-pointer items-center justify-center gap-1 rounded-sm border border-[#ffffff17] px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4656d7]"
            >
              <span>
                {day || "Select day"}
              </span>

              <img
                src={dropIcon}
                alt=""
                className={`w-3 transition-transform ${
                  show
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {show && (
              <div
                role="listbox"
                className="absolute right-0 top-10 z-50 w-40 rounded-md border border-[#ffffff17] bg-[#25253f] p-2 shadow-xl"
              >
                {Object.keys(
                  groupedHourly,
                ).map((item) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={
                      day === item
                    }
                    key={item}
                    onClick={() => {
                      setDay(item);
                      setShow(false);
                    }}
                    className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-[#2f2f49] focus:outline-none focus:ring-2 focus:ring-[#4656d7]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-md bg-[#2f2f49]"
              />
            ))}
          </div>
        ) : (
          <div className="h-90 overflow-y-auto p-3 [scrollbar-color:#55556f_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#55556f]">
            {selectedHourly.length >
            0 ? (
              selectedHourly.map(
                (item) => (
                  <div
                    key={item.time}
                    className="mb-2 flex h-12 w-full items-center justify-between rounded-md bg-[#2f2f49] p-2"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={getIcon(
                          item.weatherCode,
                        )}
                        alt={getWeatherCondition(
                          item.weatherCode,
                        )}
                        className="w-7"
                      />

                      <p className="text-sm">
                        {new Date(
                          item.time,
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: "numeric",
                            minute:
                              "2-digit",
                          },
                        )}
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
                ),
              )
            ) : (
              <p className="p-4 text-center text-sm text-gray-400">
                No hourly data available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
