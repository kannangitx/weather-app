import searchIcon from "../../assets/images/icon-search.svg";

import { useEffect, useState } from "react";

export default function Searc({ search, setSearch, setLocation }) {
  const [suggestions, setSuggestions] = useState([]);

  const [selectedPlace, setSelectedPlace] = useState(null);

  // =====================================================
  // LOCATION SUGGESTIONS
  // =====================================================

  useEffect(() => {
    if (!search?.trim()) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        console.log("Searching:", search);

        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            search,
          )}&count=5&language=en&format=json`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error("Search failed");
        }

        const data = await res.json();

        const results = data.results || [];

        // Remove duplicate places
        const uniqueResults = results.filter(
          (place, index, array) =>
            index ===
            array.findIndex(
              (item) =>
                item.name === place.name &&
                item.latitude === place.latitude &&
                item.longitude === place.longitude,
            ),
        );

        console.log("Results:", uniqueResults);

        setSuggestions(uniqueResults);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log("Search error:", error);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  function handleSearchChange(e) {
    const value = e.target.value;

    setSearch(value);

    setSelectedPlace(null);

    if (!value.trim()) {
      setSuggestions([]);
    }
  }

  // =====================================================
  // SELECT LOCATION
  // =====================================================

  function handleSuggestionClick(place) {
    console.log("Selected:", place);

    setSearch(place.name);

    setSelectedPlace(place);

    setSuggestions([]);
  }

  // =====================================================
  // SEARCH BUTTON
  // =====================================================

  function handleSearchClick() {
    console.log("SEARCH BUTTON CLICKED");

    if (!selectedPlace) {
      console.log("Please select a location first");

      return;
    }

    console.log("Selected location:", selectedPlace);

    setLocation({
      latitude: selectedPlace.latitude,

      longitude: selectedPlace.longitude,
    });
  }

  return (
    <div className="w-full flex flex-col justify-center items-center mt-10">
      {/* TITLE */}

      <h1 className="text-5xl text-white font-semibold text-center">
        How's the sky looking today?
      </h1>

      {/* SEARCH */}

      <div className="w-full flex gap-2.5 mt-10 justify-center">
        {/* INPUT */}

        <div className="bg-[#25253f] flex h-12 w-120 rounded-sm gap-2.5 p-2.5 relative">
          <img src={searchIcon} alt="Search" className="w-5" />

          <input
            type="text"
            placeholder="Search for a place..."
            value={search}
            onChange={handleSearchChange}
            className="w-full text-white placeholder:text-gray-400 focus:outline-none pl-2"
          />

          {/* SUGGESTIONS */}

          {suggestions.length > 0 && (
            <div className="absolute bg-[#25253f] w-full top-14 left-0 p-2 flex flex-col gap-1.5 rounded-sm z-50">
              {suggestions.map((place) => (
                <button
                  type="button"
                  key={`${place.id}-${place.latitude}-${place.longitude}`}
                  onClick={() => handleSuggestionClick(place)}
                  className="w-full min-h-12 flex items-center pl-2 hover:bg-[#474768da] text-white cursor-pointer rounded-sm text-left"
                >
                  <div>
                    <p className="font-medium">{place.name}</p>

                    <p className="text-xs text-gray-400">
                      {place.admin1 ? `${place.admin1}, ` : ""}
                      {place.country || ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}

        <button
          type="button"
          onClick={handleSearchClick}
          className="h-12 w-22 bg-[#4656d7] rounded-sm cursor-pointer text-amber-50"
        >
          Search
        </button>
      </div>
    </div>
  );
}
