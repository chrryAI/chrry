import React, { useState } from "react"
// import styles from "./Weather.module.scss"
import { useAppContext } from "./context/AppContext"
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudSunRain,
  Tornado,
  Snowflake,
  Cloudy,
  Settings,
} from "./icons"
import AsyncSelect from "react-select/async"

import clsx from "clsx"
import { city } from "./types"
import Modal from "./Modal"
import { t } from "i18next"
import { getFlag } from "./utils"
import { apiFetch } from "./utils"
import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"
import { selectStyles } from "./selectStyles"
import { updateGuest, updateUser } from "./lib"
import { toast } from "react-hot-toast"
import { useAuth, useData } from "./context/providers"
import { useWeatherStyles } from "./Weather.styles"
import { Button, Div, Span } from "./platform"
import { useStyles } from "./context/StylesContext"

// Register English locale
countries.registerLocale(enLocale)

export const weatherIcons: Record<number, React.ElementType> = {
  1000: Sun, // Sunny / Clear
  1003: CloudSun, // Partly cloudy
  1006: Cloud, // Cloudy
  1009: Cloudy, // Overcast
  1030: CloudFog, // Mist
  1063: CloudSunRain, // Patchy rain possible (closest: partly cloudy)
  1087: CloudLightning, // Thundery outbreaks possible
  1114: Snowflake, // Blowing snow
  1117: CloudSnow, // Blizzard
  1135: CloudFog, // Fog
  1147: CloudFog, // Freezing fog
  1150: CloudDrizzle, // Patchy light drizzle
  1153: CloudDrizzle, // Light drizzle
  1168: CloudDrizzle, // Freezing drizzle
  1171: CloudDrizzle, // Heavy freezing drizzle
  1180: CloudRain, // Patchy light rain
  1183: CloudRain, // Light rain
  1186: CloudRain, // Moderate rain at times
  1189: CloudRain, // Moderate rain
  1192: CloudRain, // Heavy rain at times
  1195: CloudRain, // Heavy rain
  1204: CloudRain, // Light sleet
  1207: CloudRain, // Moderate/heavy sleet
  1210: CloudSnow, // Patchy light snow
  1213: CloudSnow, // Light snow
  1216: CloudSnow, // Moderate snow at times
  1219: CloudSnow, // Moderate snow
  1222: CloudSnow, // Heavy snow at times
  1225: CloudSnow, // Heavy snow
  1237: Snowflake, // Ice pellets
  1240: CloudRain, // Light showers
  1243: CloudRain, // Moderate/heavy showers
  1246: CloudRain, // Torrential rain shower
  1249: CloudSnow, // Light sleet showers
  1252: CloudSnow, // Heavy sleet showers
  1255: CloudSnow, // Light snow showers
  1258: CloudSnow, // Heavy snow showers
  1261: Snowflake, // Light showers of ice pellets
  1264: Snowflake, // Heavy showers of ice pellets
  1273: CloudLightning, // Patchy thunder + rain
  1276: CloudLightning, // Thunderstorm
  1279: CloudLightning, // Patchy thunder + snow
  1282: Tornado, // Tornado
}

function getWeatherColor(code: number): string {
  if ([1000].includes(code)) return "#facc15" // sunny
  if ([1003, 1006, 1009].includes(code)) return "#9ca3af" // clouds
  if ([1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code))
    return "#3b82f6" // rain
  if ([1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code))
    return "#bae6fd" // snow
  if ([1087, 1273, 1276, 1279].includes(code)) return "#9333ea" // thunder
  if ([1282].includes(code)) return "#ef4444" // tornado
  return "#374151" // default gray
}

// Detect preferred unit based on country

export default function Weather({
  style,
  showLocation,
  onLocationClick,
}: {
  style?: React.CSSProperties
  showLocation?: boolean
  onLocationClick?: (location: string) => void
}) {
  const { weather, refetchWeather, actions } = useData()

  const styles = useWeatherStyles()

  const { utilities } = useStyles()

  const { user, guest, token, setUser, setGuest, API_URL } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  async function callApi(value: string) {
    if (!token) {
      console.warn("Token not ready yet")
      return []
    }
    setIsLoading(true)
    const data = await apiFetch(`${API_URL}/cities?search=${value}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        return response.map((data: city) => ({
          value: data.name,
          country: data.country,
          label: `${data.name}, ${data.country}`,
        }))
      })
      .catch((error) => {
        toast.error(t("Something went wrong"))
        return []
      })
      .finally(() => {
        setIsLoading(false)
      })

    return data
  }

  const [isCityModalOpen, setIsCityModalOpen] = useState(false)

  const city = weather?.location || (user || guest)?.city || ""
  const country = weather?.country || (user || guest)?.country || ""
  function getCountryCode(countryName: string): string {
    const code = countries.getAlpha2Code(countryName, "en")
    return code || countryName
  }

  if (!city || !country) return null

  return (
    <Div
      {...(weather
        ? {
            "aria-label": `${t(weather.condition)} - ${weather.location}, ${weather.country}`,
            title: `${t(weather.condition)} - ${weather.location}, ${weather.country}`,
          }
        : {})}
      style={{
        ...styles.weather.style,
        ...style,
      }}
    >
      {country && (
        <Modal
          id="city-modal"
          hideOnClickOutside={false}
          hasCloseButton
          icon={
            country ? getFlag({ code: getCountryCode(country) }) : undefined
          }
          title={t("Select location")}
          isModalOpen={isCityModalOpen}
          onToggle={(open) => setIsCityModalOpen(open)}
        >
          <AsyncSelect
            isClearable
            placeholder={t("Select city")}
            cacheOptions
            isLoading={isLoading}
            classNamePrefix="react-select"
            menuPortalTarget={
              typeof document !== "undefined"
                ? document.getElementById("city-modal")
                : null
            }
            styles={{
              ...selectStyles,
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base, state) => ({
                ...selectStyles.control?.(base, state),
              }),
            }}
            loadOptions={callApi}
            onChange={async (selectedCity: any) => {
              if (!selectedCity?.value) return

              setIsCityModalOpen(false) // Close modal on success

              try {
                if (user) {
                  const updated = await actions.updateUser({
                    city: selectedCity.value,
                    country: countries.getName(selectedCity.country, "en"),
                  })

                  if (updated.error) {
                    toast.error(updated.error)
                    return
                  }
                  setUser(updated)
                } else if (guest) {
                  const updated = await actions.updateGuest({
                    city: selectedCity.value,
                    country: countries.getName(selectedCity.country, "en"),
                  })
                  if (updated.error) {
                    toast.error(updated.error)
                    return
                  }
                  setGuest(updated)
                }

                toast.success(t("Updated"))

                refetchWeather()
              } catch (error) {
                toast.error(t("Something went wrong"))
              }
            }}
            defaultOptions
            defaultValue={
              city && country
                ? {
                    label: `${city}, ${country}`,
                    value: city,
                    country: country,
                  }
                : undefined
            }
          />
        </Modal>
      )}
      <Button onClick={() => setIsCityModalOpen(true)} className={"link"}>
        <Settings size={18} />
      </Button>
      {(() => {
        if (!weather) return null
        const Icon = weatherIcons[weather.code]
        if (!Icon) return null
        return <Icon color={getWeatherColor(weather.code)} size={18} />
      })()}
      <Span style={styles.info.style}>
        {weather && <Span>{weather.temperature}</Span>}
        {showLocation && (
          <Span
            onClick={() =>
              weather &&
              onLocationClick?.(`${weather.location}, ${weather.country}`)
            }
            className={clsx(styles.location)}
          >
            {city}, {country}
          </Span>
        )}
      </Span>
    </Div>
  )
}
