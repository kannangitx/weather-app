export function getDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getWordDay(date, type) {
  const d = new Date(date);

  return d.toLocaleDateString("en-US", {
    weekday: type,
  });
}

export async function getPlaceDetails(
  latitude,
  longitude,
) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
  );

  if (!res.ok) {
    throw new Error(
      "Failed to get place details",
    );
  }

  return await res.json();
}

export function getWeatherCondition(code) {
  if (code === 0 || code === 1) {
    return "sunny";
  }

  if (code === 2) {
    return "partlycloudy";
  }

  if (code === 3) {
    return "overcast";
  }

  if (code === 45 || code === 48) {
    return "fog";
  }

  if (code >= 51 && code <= 57) {
    return "drizzle";
  }

  if (code >= 61 && code <= 67) {
    return "rain";
  }

  if (code >= 71 && code <= 77) {
    return "snow";
  }

  if (code >= 80 && code <= 82) {
    return "rain";
  }

  if (code === 85 || code === 86) {
    return "snow";
  }

  if (code >= 95 && code <= 99) {
    return "storm";
  }

  return "unknown";
}
