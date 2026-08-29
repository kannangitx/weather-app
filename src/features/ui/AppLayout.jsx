import { useEffect, useState } from "react";
import Result from "../result/Result";
import Searc from "../search/Searc";
import Header from "./Header";

export default function AppLayout() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [units, setUnits] = useState({
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
  });

  const geolocationSupported =
    typeof navigator !== "undefined" &&
    "geolocation" in navigator;

  useEffect(() => {
    if (!geolocationSupported) {
      setLocationLoading(false);
      setLocationError(
        "Geolocation is not supported by your browser.",
      );
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
    <div className="min-h-dvh w-full bg-[#02012b] px-4 py-4 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1100px]">
        <Header units={units} setUnits={setUnits} />

        <Searc
          search={search}
          setSearch={setSearch}
          setLocation={setLocation}
        />

        {!geolocationSupported && (
          <p className="mt-3 text-center text-sm text-gray-400">
            Geolocation is not supported by your browser.
          </p>
        )}

        {geolocationSupported && locationError && (
          <p className="mt-3 text-center text-sm text-gray-400">
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
