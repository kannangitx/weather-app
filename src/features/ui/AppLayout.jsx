import { useEffect, useState } from "react";

import Result from "../result/Result";
import Searc from "../search/Searc";
import Header from "./Header";

export default function AppLayout() {
  const geolocationSupported =
    typeof navigator !== "undefined" &&
    "geolocation" in navigator;

  const [search, setSearch] = useState("");

  const [location, setLocation] = useState(null);

  const [locationLoading, setLocationLoading] =
    useState(geolocationSupported);

  const [locationError, setLocationError] =
    useState("");

  const [units, setUnits] = useState({
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
  });

  useEffect(() => {
    if (!geolocationSupported) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
        setLocationError("");
      },
      () => {
        setLocationLoading(false);
        setLocationError(
          "Location permission denied. Please search for a place.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [geolocationSupported]);

  return (
    <div className="min-h-dvh w-full bg-[#02012b] px-4 py-4 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Header
          units={units}
          setUnits={setUnits}
        />

        <Searc
          search={search}
          setSearch={setSearch}
          setLocation={setLocation}
        />

        {!geolocationSupported && (
          <p className="mt-4 text-center text-sm text-gray-400">
            Geolocation is not supported by your browser.
          </p>
        )}

        {geolocationSupported &&
          locationError && (
            <p className="mt-4 text-center text-sm text-gray-400">
              {locationError}
            </p>
          )}

        <Result
          location={location}
          locationLoading={locationLoading}
          units={units}
        />
      </div>
    </div>
  );
}
