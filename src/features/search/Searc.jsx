import searchIcon from "../../assets/images/icon-search.svg";

import { useEffect, useState } from "react";

export default function Searc({
  search,
  setSearch,
  setLocation,
}) {
  const [suggestions, setSuggestions] =
    useState([]);

  const [selectedPlace, setSelectedPlace] =
    useState(null);

  const [searchError, setSearchError] =
    useState("");

  useEffect(() => {
    const value = search?.trim();

    if (!value) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            value,
          )}&count=5&language=en&format=json`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error(
            "Unable to search location",
          );
        }

        const data = await res.json();

        const results = data.results || [];

        const uniqueResults =
          results.filter(
            (place, index, array) =>
              index ===
              array.findIndex(
                (item) =>
                  item.name ===
                    place.name &&
                  item.latitude ===
                    place.latitude &&
                  item.longitude ===
                    place.longitude,
              ),
          );

        setSuggestions(uniqueResults);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setSearchError(
            "Unable to search for this location.",
          );
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

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

  function handleSearchClick() {
    const place =
      selectedPlace || suggestions[0];

    if (!place) {
      setSearchError(
        "Please enter a valid city or location.",
      );
      return;
    }

    setSearch(place.name);
    setSelectedPlace(place);
    setSuggestions([]);

    setLocation({
      latitude: place.latitude,
      longitude: place.longitude,
    });

    setSearchError("");
  }

  return (
    <div className="flex w-full flex-col items-center justify-center pt-8 md:pt-10">
      <h1 className="text-center text-3xl font-semibold text-white md:text-5xl">
        How's the sky looking today?
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchClick();
        }}
        className="mt-8 flex w-full max-w-160 gap-2.5"
      >
        <div className="relative flex h-12 min-w-0 flex-1 gap-2.5 rounded-sm bg-[#25253f] p-2.5">
          <img
            src={searchIcon}
            alt=""
            className="w-5 shrink-0"
          />

          <input
            type="text"
            placeholder="Search for a place..."
            value={search}
            onChange={handleSearchChange}
            className="w-full min-w-0 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4656d7]"
            aria-label="Search for a place"
          />

          {suggestions.length > 0 && (
            <div className="absolute left-0 top-14 z-50 flex w-full flex-col gap-1.5 rounded-sm bg-[#25253f] p-2 shadow-xl">
              {suggestions.map((place) => (
                <button
                  type="button"
                  key={`${place.id}-${place.latitude}-${place.longitude}`}
                  onClick={() =>
                    handleSuggestionClick(place)
                  }
                  className="flex min-h-12 w-full cursor-pointer items-center rounded-sm pl-2 text-left text-white hover:bg-[#474768da] focus:outline-none focus:ring-2 focus:ring-[#4656d7]"
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
          className="h-12 w-22 shrink-0 cursor-pointer rounded-sm bg-[#4656d7] text-amber-50 transition hover:bg-[#5665e5] focus:outline-none focus:ring-2 focus:ring-white"
        >
          Search
        </button>
      </form>

      {searchError && (
        <p className="mt-3 text-center text-sm text-red-400">
          {searchError}
        </p>
      )}
    </div>
  );
}
