"use client"
import { useEffect, useState } from "react"
import { Palette, Clock } from "./icons"
import styles from "./QuotaDisplay.module.scss"
import { useAuth } from "./context/providers"
import { apiFetch } from "chrry/utils"

interface QuotaInfo {
  images?: {
    used: number
    limit: number
    resetTime: string
  }
  hourly?: {
    used: number
    limit: number
    resetTime: string
  }
  daily?: {
    used: number
    limit: number
    resetTime: string
  }
  dailySize?: {
    used: number
    limit: number
    resetTime: string
  }
}

interface QuotaDisplayProps {
  isVisible: boolean
  onClose?: () => void
}

export default function QuotaDisplay({
  isVisible,
  onClose,
}: QuotaDisplayProps) {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const { API_URL } = useAuth()

  const fetchQuotaInfo = async () => {
    if (!isVisible) return

    setLoading(true)
    try {
      const response = await apiFetch(`${API_URL}/messages?quota=true`)
      if (response.ok) {
        const data = await response.json()
        setQuotaInfo(data.quotaInfo)
      }
    } catch (error) {
      console.error("Failed to fetch quota info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotaInfo()
  }, [isVisible])

  const formatTimeUntilReset = (resetTime: string) => {
    const now = new Date()
    const reset = new Date(resetTime)
    const diff = reset.getTime() - now.getTime()

    if (diff <= 0) return "Soon"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getProgressPercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return "#ef4444" // red
    if (percentage >= 70) return "#f59e0b" // amber
    return "#10b981" // green
  }

  if (!isVisible) return null

  return (
    <div className={styles.quotaOverlay} onClick={onClose}>
      <div className={styles.quotaModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.quotaHeader}>
          <h3>Usage Quotas</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading quota information...</div>
        ) : quotaInfo ? (
          <div className={styles.quotaContent}>
            {quotaInfo.images && (
              <div className={styles.quotaSection}>
                <div className={styles.quotaTitle}>
                  <Palette size={16} />
                  <span>Image Generation</span>
                </div>
                <div className={styles.quotaBar}>
                  <div className={styles.quotaProgress}>
                    <div
                      className={styles.quotaFill}
                      style={{
                        width: `${getProgressPercentage(quotaInfo.images.used, quotaInfo.images.limit)}%`,
                        backgroundColor: getProgressColor(
                          quotaInfo.images.used,
                          quotaInfo.images.limit,
                        ),
                      }}
                    />
                  </div>
                  <div className={styles.quotaText}>
                    {quotaInfo.images.used} / {quotaInfo.images.limit} images
                  </div>
                </div>
                <div className={styles.quotaReset}>
                  <Clock size={12} />
                  <span>
                    Resets in {formatTimeUntilReset(quotaInfo.images.resetTime)}
                  </span>
                </div>
              </div>
            )}

            {quotaInfo.daily && (
              <div className={styles.quotaSection}>
                <div className={styles.quotaTitle}>
                  <span>📁</span>
                  <span>File Uploads (Daily)</span>
                </div>
                <div className={styles.quotaBar}>
                  <div className={styles.quotaProgress}>
                    <div
                      className={styles.quotaFill}
                      style={{
                        width: `${getProgressPercentage(quotaInfo.daily.used, quotaInfo.daily.limit)}%`,
                        backgroundColor: getProgressColor(
                          quotaInfo.daily.used,
                          quotaInfo.daily.limit,
                        ),
                      }}
                    />
                  </div>
                  <div className={styles.quotaText}>
                    {quotaInfo.daily.used} / {quotaInfo.daily.limit} files
                  </div>
                </div>
                <div className={styles.quotaReset}>
                  <Clock size={12} />
                  <span>
                    Resets in {formatTimeUntilReset(quotaInfo.daily.resetTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noData}>No quota information available</div>
        )}
      </div>
    </div>
  )
}
