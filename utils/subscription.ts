export const getFeatures = ({
  t,
  ADDITIONAL_CREDITS,
  CREDITS_PRICE,
}: {
  t: (key: string, options?: any) => string
  ADDITIONAL_CREDITS: number
  CREDITS_PRICE: number
}) => {
  const plusFeatures = [
    {
      emoji: "🤖",
      text: `${t("AI credits per month", { credits: `${2000}`, freeCredits: 150 })}`,
    },
    {
      emoji: "⚡",
      text: t("Messages per hour", { messages: 100, freeMessages: 30 }),
    },

    {
      emoji: "✨",
      text: t("Character profiles per day", { profiles: 50 }),
    },
    {
      emoji: "👩‍💻",
      text: t("Create apps in your store with unlimited collaboration"),
    },
    {
      emoji: "🖼️",
      text: t("Image processing & analysis"),
    },
    {
      emoji: "🌟",
      text: t("Priority support & assistance"),
    },
    {
      emoji: "🎤",
      text: t("Unlimited voice conversations"),
    },
    {
      emoji: "🌱",
      text: t("0.5% of subscription goes to CO₂ removal"),
    },
  ]

  const memberFeatures = [
    {
      emoji: "🧠",
      text: t("Access to AI models"),
    },
    {
      emoji: "🤖",
      text: `${t("AI credits per month compare to guest", {
        credits: `${150}`,
        freeCredits: 30,
      })}`,
    },

    {
      emoji: "⚡",
      text: t("Messages per hour compare to guest", {
        messages: 30,
        freeMessages: 10,
      }),
    },
    {
      emoji: "📁",
      text: t("File upload & analysis support"),
    },
    {
      emoji: "✨",
      text: t("Character profiles per day", { profiles: 25 }),
    },
    {
      emoji: "👩‍💻",
      text: t("Create apps in your store with unlimited collaboration"),
    },
    {
      emoji: "🌐",
      text: t("Web, PWA & extension access"),
    },
    {
      emoji: "🎨",
      text: t("Custom themes & personalization"),
    },
    {
      emoji: "🔄",
      text: t("Cross-device sync & history"),
    },
  ]

  const proFeatures = [
    {
      emoji: "🌀",
      text: t("Unlimited stores with nested apps"),
    },
    {
      emoji: "👩‍💻",
      text: t("Create custom AI apps with team collaboration"),
    },
    {
      emoji: "🚀",
      text: `${t("AI credits per month", { credits: `${5000}`, freeCredits: 150 })}`,
    },
    {
      emoji: "⚡",
      text: t("Messages per hour", { messages: 200, freeMessages: 30 }),
    },
    {
      emoji: "✨",
      text: t("Character profiles per day", { profiles: 75 }),
    },
    {
      emoji: "🔄",
      text: t("Higher generation limits (25 titles/instructions per hour)"),
    },
    {
      emoji: "🌱",
      text: t("0.5% of subscription goes to CO₂ removal"),
    },
  ]
  const creditsFeatures = [
    {
      emoji: "💰",
      text: `${t("credits_pricing", {
        credits: `${ADDITIONAL_CREDITS}`,
        price: `${CREDITS_PRICE}.00`,
      })}`,
    },

    {
      emoji: "✨",
      text: t("No commitment required"),
    },
    {
      emoji: "👩‍💻",
      text: t("Create apps in your store with unlimited collaboration"),
    },
    {
      emoji: "🌱",
      text: t("0.5% of purchase goes to CO₂ removal"),
    },
    {
      emoji: "🥰",
      text: t("Pay as you go"),
    },
  ].filter((x) => x !== null)

  return {
    plusFeatures,
    memberFeatures,
    creditsFeatures,
    proFeatures,
  }
}
