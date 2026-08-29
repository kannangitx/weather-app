import { useEffect, useState } from "react";

import Result from "../result/Result";
import Searc from "../search/Searc";
import Header from "./Header";

export default function AppLayout() {
  // SEARCH

  const [search, setSearch] = useState("");

  // LOCATION

  const [location, setLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState("");

  // UNITS

  const [units, setUnits] = useState({
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
  });

  // GEOLOCATION SUPPORT

  const geolocationSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  // GET USER CURRENT LOCATION

  useEffect(() => {
    if (!geolocationSupported) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(
          "User location:",
          position.coords.latitude,
          position.coords.longitude,
        );

        setLocation({
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
        setLocationError("");
      },

      (error) => {
        console.log("Geolocation error:", error);

        setLocationError(
          "Location permission denied. Please search for a place.",
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [geolocationSupported]);

  // UI

  return (
    <div className="flex flex-col items-center w-full min-h-dvh px-12 py-8 bg-[#02012b]">
      {/* HEADER */}

      <Header units={units} setUnits={setUnits} />

      {/* SEARCH */}

      <Searc search={search} setSearch={setSearch} setLocation={setLocation} />

      {/* LOCATION ERROR */}

      {!geolocationSupported && (
        <p className="text-gray-400 text-sm mt-4">
          Geolocation is not supported by your browser.
        </p>
      )}

      {geolocationSupported && locationError && (
        <p className="text-gray-400 text-sm mt-4 text-center">
          {locationError}
        </p>
      )}

      {/* RESULT */}

      <Result
        location={location}
        locationLoading={locationLoading}
        units={units}
      />
    </div>
  );
}
