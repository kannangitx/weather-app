import { useState } from "react";
import settingsIcon from "../../assets/images/icon-units.svg";
import dropdownIcon from "../../assets/images/icon-dropdown.svg";

export default function Units({ units, setUnits }) {
  const [showUnits, setShowUnits] = useState(false);

  const isImperial =
    units.temperature === "fahrenheit" &&
    units.windSpeed === "mph" &&
    units.precipitation === "inch";

  function handleSystemToggle() {
    if (isImperial) {
      setUnits({
        temperature: "celsius",
        windSpeed: "kmh",
        precipitation: "mm",
      });
    } else {
      setUnits({
        temperature: "fahrenheit",
        windSpeed: "mph",
        precipitation: "inch",
      });
    }
  }

  function handleTemperature(value) {
    setUnits((previous) => ({
      ...previous,
      temperature: value,
    }));
  }

  function handleWindSpeed(value) {
    setUnits((previous) => ({
      ...previous,
      windSpeed: value,
    }));
  }

  function handlePrecipitation(value) {
    setUnits((previous) => ({
      ...previous,
      precipitation: value,
    }));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowUnits((previous) => !previous)}
        aria-expanded={showUnits}
        className="h-10 px-3 bg-[#25253f] text-white rounded-md flex items-center gap-2 cursor-pointer hover:bg-[#30304d]"
      >
        <img src={settingsIcon} alt="" className="w-4" />

        <span>Units</span>

        <img
          src={dropdownIcon}
          alt=""
          className={`w-3 transition-transform duration-200 ${
            showUnits ? "rotate-180" : ""
          }`}
        />
      </button>

      {showUnits && (
        <div className="absolute right-0 top-12 w-52 bg-[#25253f] rounded-md p-3 z-50 shadow-xl text-white">
          <button
            type="button"
            onClick={handleSystemToggle}
            className="w-full text-left font-semibold text-sm mb-4 hover:text-gray-300 cursor-pointer"
          >
            {isImperial ? "Switch to Metric" : "Switch to Imperial"}
          </button>

          <p className="text-gray-400 text-sm mb-1">
            Temperature
          </p>

          <button
            type="button"
            onClick={() => handleTemperature("celsius")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-gray-300"
          >
            <span>Celsius (°C)</span>

            {units.temperature === "celsius" && (
              <span>✓</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTemperature("fahrenheit")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-gray-300"
          >
            <span>Fahrenheit (°F)</span>

            {units.temperature === "fahrenheit" && (
              <span>✓</span>
            )}
          </button>

          <p className="text-gray-400 text-sm mt-4 mb-1">
            Wind Speed
          </p>

          <button
            type="button"
            onClick={() => handleWindSpeed("kmh")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-gray-300"
          >
            <span>km/h</span>

            {units.windSpeed === "kmh" && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handleWindSpeed("mph")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-gray-300"
          >
            <span>mph</span>

            {units.windSpeed === "mph" && <span>✓</span>}
          </button>

          <p className="text-gray-400 text-sm mt-4 mb-1">
            Precipitation
          </p>

          <button
            type="button"
            onClick={() => handlePrecipitation("mm")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-gray-300"
          >
            <span>Millimeters (mm)</span>

            {units.precipitation === "mm" && <span>✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handlePrecipitation("inch")}
            className="w-full flex justify-between items-center text-left py-1.5 cursor-pointer hover:text-gray-300"
          >
            <span>Inches (in)</span>

            {units.precipitation === "inch" && <span>✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
