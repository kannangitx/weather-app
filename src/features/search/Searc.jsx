import searchIcon from "../../assets/images/icon-search.svg";
import { useEffect, useRef, useState } from "react";

export default function Searc({ search, setSearch, setLocation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!search?.trim()) {
      setSuggestions([]);
      return;
    }

    if (selectedPlace && selectedPlace.name === search) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            search.trim(),
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
  }, [search, selectedPlace]);

  function handleSearchChange(e) {
    const value = e.target.value;

    setSearch(value);
    setSelectedPlace(null);
    setSearchError("");

    if (!value.trim()) {
      setSuggestions([]);
    }
  }

  function handleSuggestionClick(place) {
    setSearch(place.name);
    setSelectedPlace(place);
    setSuggestions([]);
    setSearchError("");
  }

  async function searchLocation(placeName) {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        placeName.trim(),
      )}&count=5&language=en&format=json`,
    );

    if (!res.ok) {
      throw new Error("Location search failed");
    }

    const data = await res.json();

    return data.results?.[0] || null;
  }

  async function handleSearchSubmit(e) {
    e.preventDefault();

    setSuggestions([]);
    setSearchError("");

    inputRef.current?.blur();

    let place = selectedPlace;

    try {
      setSearchLoading(true);

      if (!place) {
        place = await searchLocation(search);
      }

      if (!place) {
        setSearchError(
          "Location not found. Please enter a valid city, state, or district.",
        );
        return;
      }

      setSearch(place.name);

      setSelectedPlace(place);

      setLocation({
        latitude: place.latitude,
        longitude: place.longitude,
      });

      setSuggestions([]);
    } catch (error) {
      console.log("Search error:", error);

      setSearchError(
        "Unable to find this location. Please try again.",
      );
    } finally {
      setSearchLoading(false);

      inputRef.current?.blur();
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center mt-10">
      <h1 className="text-3xl md:text-5xl text-white font-semibold text-center">
        How's the sky looking today?
      </h1>

      <form
        onSubmit={handleSearchSubmit}
        className="w-full flex flex-col items-center"
      >
        <div className="w-full flex gap-2.5 mt-10 justify-center">
          <div className="bg-[#25253f] flex h-12 w-full md:w-120 rounded-sm gap-2.5 p-2.5 relative">
            <img
              src={searchIcon}
              alt="Search"
              className="w-5"
            />

            <input
              ref={inputRef}
              type="text"
              placeholder="Search for a place..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => {
                if (search.trim() && suggestions.length > 0) {
                  setSuggestions(suggestions);
                }
              }}
              className="w-full text-white placeholder:text-gray-400 focus:outline-none pl-2"
            />

            {suggestions.length > 0 && (
              <div className="absolute bg-[#25253f] w-full top-14 left-0 p-2 flex flex-col gap-1.5 rounded-sm z-50 shadow-lg">
                {suggestions.map((place) => (
                  <button
                    type="button"
                    key={`${place.id}-${place.latitude}-${place.longitude}`}
                    onClick={() => handleSuggestionClick(place)}
                    className="w-full min-h-12 flex items-center pl-2 hover:bg-[#474768da] text-white cursor-pointer rounded-sm text-left"
                  >
                    <div>
                      <p className="font-medium">
                        {place.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {place.admin1
                          ? `${place.admin1}, `
                          : ""}
                        {place.country || ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={searchLoading || !search.trim()}
            className="h-12 w-22 bg-[#4656d7] rounded-sm cursor-pointer text-white shrink-0 hover:bg-[#5363e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? "..." : "Search"}
          </button>
        </div>

        {searchError && (
          <p className="text-red-400 text-sm mt-3 text-center">
            {searchError}
          </p>
        )}
      </form>
    </div>
  );
}
