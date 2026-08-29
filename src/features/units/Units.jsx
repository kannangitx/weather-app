import { useState } from "react";

import settingsIcon from "../../assets/images/icon-units.svg";
import dropdownIcon from "../../assets/images/icon-dropdown.svg";

export default function Units({ units, setUnits }) {
  const [showUnits, setShowUnits] = useState(false);

  // TEMPERATURE

  function handleTemperature(value) {
    setUnits((previous) => ({
      ...previous,
      temperature: value,
    }));
  }

  // WIND SPEED

  function handleWindSpeed(value) {
    setUnits((previous) => ({
      ...previous,
      windSpeed: value,
    }));
  }

  // PRECIPITATION

  function handlePrecipitation(value) {
    setUnits((previous) => ({
      ...previous,
      precipitation: value,
    }));
  }

  // TOGGLE DROPDOWN

  function handleToggle() {
    setShowUnits((previous) => !previous);
  }

  return (
    <div className="relative">
      {/* 
          UNITS BUTTON
     */}

      <button
        type="button"
        onClick={handleToggle}
        className="h-10 px-3 bg-[#25253f] text-white rounded-md flex items-center gap-2 cursor-pointer"
      >
        <img src={settingsIcon} alt="settings" className="w-4" />

        <span>Units</span>

        <img
          src={dropdownIcon}
          alt="dropdown"
          className={`w-3 transition-transform ${
            showUnits ? "rotate-180" : ""
          }`}
        />
      </button>

      {/*
          DROPDOWN
       */}

      {showUnits && (
        <div className="absolute right-0 top-12 w-48 bg-[#25253f] rounded-md p-3 z-50 shadow-xl text-white">
          {/* 
              SWITCH TO IMPERIAL
          */}

          <p className="font-semibold text-sm mb-4">Switch to Imperial</p>

          {/* 
              TEMPERATURE
           */}

          <p className="text-gray-400 text-sm mb-1">Temperature</p>

          {/* CELSIUS */}

          <button
            type="button"
            onClick={() => handleTemperature("celsius")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-white"
          >
            <span>Celsius (°C)</span>

            {units.temperature === "celsius" && (
              <span className="text-white">✓</span>
            )}
          </button>

          {/* FAHRENHEIT */}

          <button
            type="button"
            onClick={() => handleTemperature("fahrenheit")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-white"
          >
            <span>Fahrenheit (°F)</span>

            {units.temperature === "fahrenheit" && (
              <span className="text-white">✓</span>
            )}
          </button>

          {/*
              WIND SPEED
           */}

          <p className="text-gray-400 text-sm mt-4 mb-1">Wind Speed</p>

          {/* KM/H */}

          <button
            type="button"
            onClick={() => handleWindSpeed("kmh")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-white"
          >
            <span>km/h</span>

            {units.windSpeed === "kmh" && <span>✓</span>}
          </button>

          {/* MPH */}

          <button
            type="button"
            onClick={() => handleWindSpeed("mph")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-white"
          >
            <span>mph</span>

            {units.windSpeed === "mph" && <span>✓</span>}
          </button>

          {/* 
              PRECIPITATION
           */}

          <p className="text-gray-400 text-sm mt-4 mb-1">Precipitation</p>

          {/* MILLIMETERS */}

          <button
            type="button"
            onClick={() => handlePrecipitation("mm")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-white"
          >
            <span>Millimeters (mm)</span>

            {units.precipitation === "mm" && <span>✓</span>}
          </button>

          {/* INCHES */}

          <button
            type="button"
            onClick={() => handlePrecipitation("inch")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-white"
          >
            <span>Inches (in)</span>

            {units.precipitation === "inch" && <span>✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
