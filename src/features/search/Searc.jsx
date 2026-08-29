import searchIcon from "../../assets/images/icon-search.svg";
import { useEffect, useState } from "react";

export default function Searc({
  search,
  setSearch,
  setLocation,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const value = search?.trim();

    if (!value) {
      setSuggestions([]);
      return;
    }

    if (
      selectedPlace &&
      selectedPlace.name === value
    ) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            value,
          )}&count=5&language=en&format=json`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) {
          throw new Error("Search failed");
        }

        const data = await res.json();

        if (controller.signal.aborted) {
          return;
        }

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

        if (uniqueResults.length === 0) {
          setSearchError("No locations found.");
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Search error:", error);

        setSuggestions([]);
        setSearchError(
          "Unable to search for this location.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
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

  function handleSearchClick() {
    const placeToSearch =
      selectedPlace || suggestions[0];

    if (!placeToSearch) {
      setSearchError(
        "Please enter a valid city, state, or district.",
      );
      return;
    }

    setLocation({
      latitude: placeToSearch.latitude,
      longitude: placeToSearch.longitude,
      name: placeToSearch.name,
      country: placeToSearch.country,
      admin1: placeToSearch.admin1,
    });

    setSearch(placeToSearch.name);
    setSuggestions([]);
    setSelectedPlace(placeToSearch);
    setSearchError("");
  }

  return (
    <section className="mt-8 flex w-full flex-col items-center justify-center md:mt-10">
      <h1 className="text-center text-3xl font-semibold text-white md:text-5xl">
        How's the sky looking today?
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchClick();
        }}
        className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row md:mt-10"
      >
        <div className="relative flex h-12 w-full items-center gap-2.5 rounded-sm bg-[#25253f] p-2.5">
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
            aria-label="Search for a place"
            className="w-full bg-transparent pl-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4656d7]"
          />

          {searchLoading && (
            <div className="mr-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
          )}

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
          disabled={searchLoading}
          className="h-12 w-full shrink-0 cursor-pointer rounded-sm bg-[#4656d7] text-amber-50 transition hover:bg-[#5969e8] focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-24"
        >
          Search
        </button>
      </form>

      {searchError && (
        <p
          role="alert"
          className="mt-2 text-center text-sm text-red-400"
        >
          {searchError}
        </p>
      )}
    </section>
  );
}
