export const getWeatherCacheTime = (weatherData: any): number => {
  if (!weatherData || !weatherData?.current?.condition?.text) return 900
  const condition = weatherData?.current?.condition?.text.toLowerCase()
  const windSpeed = weatherData?.current?.wind_kph || 0

  // Severe weather - 5 minutes
  const severeKeywords = [
    "storm",
    "thunder",
    "lightning",
    "tornado",
    "hurricane",
    "cyclone",
    "typhoon",
    "hail",
  ]
  if (severeKeywords.some((kw) => condition.includes(kw))) {
    return 300
  }

  // Active precipitation or high wind - 7 minutes
  const activeKeywords = [
    "rain",
    "snow",
    "drizzle",
    "shower",
    "sleet",
    "squall",
    "blizzard",
  ]
  if (activeKeywords.some((kw) => condition.includes(kw)) || windSpeed > 30) {
    return 420
  }

  // Changing conditions - 10 minutes
  const changingKeywords = ["fog", "mist", "overcast", "cloudy"]
  if (changingKeywords.some((kw) => condition.includes(kw))) {
    return 600
  }

  // Stable conditions - 15 minutes
  return 900
}
