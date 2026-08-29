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

  // GET USER CURRENT LOCATION
  useEffect(() => {
    // Check geolocation inside the effect
    // instead of calculating it during render.
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      setLocationLoading(false);
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;

        const { latitude, longitude } =
          position.coords;

        setLocation({
          latitude,
          longitude,
        });

        setLocationLoading(false);
        setLocationError("");
      },

      (error) => {
        if (cancelled) return;

        console.log("Geolocation error:", error);

        setLocationLoading(false);

        setLocationError(
          "Location permission denied. Please search for a place."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-[#02012b] px-4 py-6 md:px-12 md:py-8">

      {/* HEADER */}
      <header className="w-full">
        <Header
          units={units}
          setUnits={setUnits}
        />
      </header>

      {/* MAIN */}
      <main className="w-full">
        
        {/* SEARCH */}
        <Searc
          search={search}
          setSearch={setSearch}
          setLocation={setLocation}
        />

        {/* LOCATION ERROR */}
        {locationError && (
          <p
            role="alert"
            className="mt-4 text-center text-sm text-gray-400"
          >
            {locationError}
          </p>
        )}

        {/* RESULT */}
        <Result
          location={location}
          locationLoading={locationLoading}
          units={units}
        />
      </main>
    </div>
  );
}
