import { useEffect, useState } from "react"
import { COLORS, useAppContext } from "./context/AppContext"
import { useAuth, useChat } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import Img from "./Image"
import Modal from "./Modal"
import { Button, Div, H3, P, Span } from "./platform"
import type { appWithStore } from "./types"

import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

const Grapes = ({
  style,
  goToGrape,
  dataTestId,
}: {
  style?: React.CSSProperties
  goToGrape?: boolean
  dataTestId?: string
}) => {
  const { grapes, setIsPear, grape, plausible, showGrapes, setShowGrapes } =
    useAuth()

  const { setIsNewAppChat } = useChat()
  const [selectedGrapeApp, setSelectedGrapeAppInternal] = useState<
    appWithStore | undefined
  >(grapes[0])

  const setSelectedGrapeApp = (app: appWithStore | undefined) => {
    setSelectedGrapeAppInternal(app)
    plausible({
      name: ANALYTICS_EVENTS.GRAPE_APP_SELECT,
      props: {
        app: app?.name,
        slug: app?.slug,
        id: app?.id,
      },
    })
  }

  useEffect(() => {
    !selectedGrapeApp && setSelectedGrapeApp(grapes[0])
  }, [grapes, selectedGrapeApp])

  const { utilities } = useStyles()

  const { t } = useAppContext()

  if (!grapes.length && !goToGrape) return null

  return (
    <Div>
      {grapes.length > 0 && (
        <Modal
          isModalOpen={showGrapes}
          hasCloseButton={true}
          hideOnClickOutside={false}
          onToggle={(open) => {
            if (!open) {
              setShowGrapes(false)
              setSelectedGrapeApp(undefined)
              plausible({
                name: ANALYTICS_EVENTS.GRAPE_MODAL_CLOSE,
                props: {
                  apps_shown: grapes.length,
                },
              })
            } else {
              setShowGrapes(true)
              plausible({
                name: ANALYTICS_EVENTS.GRAPE_MODAL_OPEN,
                props: {
                  apps_available: grapes.length,
                },
              })
            }
          }}
          icon={"🍇"}
          title={<Div>{t("Discover apps, earn credits")}</Div>}
        >
          <Div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* App List */}
            <Div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 15,
                fontSize: 14,
              }}
            >
              {grapes?.map((app) => (
                <Button
                  data-testid="grapes-app-button"
                  key={app.id}
                  className={`card link border ${selectedGrapeApp?.id === app.id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedGrapeApp(app)
                  }}
                  style={{
                    ...utilities.link.style,
                    ...{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      border: "1px dashed var(--shade-2)",
                      borderRadius: 20,
                      padding: 10,
                      flex: 1,
                    },
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    padding: "15px",
                    borderColor:
                      selectedGrapeApp?.id === app.id
                        ? COLORS[app.themeColor as keyof typeof COLORS]
                        : "var(--shade-2)",
                    borderStyle: "solid",
                  }}
                >
                  <Img app={app} showLoading={false} size={50} />
                  <Span
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      color: "var(--shade-7)",
                    }}
                  >
                    {app.name}
                  </Span>
                </Button>
              ))}
            </Div>

            {/* Selected App Details */}
            {selectedGrapeApp && (
              <Div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  padding: "20px",
                  borderTop: "1px dashed var(--shade-2)",
                }}
              >
                <Div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Img app={selectedGrapeApp} showLoading={false} size={40} />
                  <Div>
                    <H3
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                      }}
                    >
                      {selectedGrapeApp.icon} {selectedGrapeApp.name}
                    </H3>
                    <Span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--shade-6)",
                      }}
                    >
                      {t(selectedGrapeApp.subtitle || selectedGrapeApp.title)}
                    </Span>
                  </Div>
                </Div>

                <P
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--shade-7)",
                    margin: 0,
                  }}
                >
                  {t(selectedGrapeApp.description || "")}
                </P>

                <Div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <Button
                    data-testid="grapes-feedback-button"
                    className="button inverted"
                    onClick={() => {
                      plausible({
                        name: ANALYTICS_EVENTS.GRAPE_PEAR_FEEDBACK,
                        props: {
                          app: selectedGrapeApp.name,
                          slug: selectedGrapeApp.slug,
                          id: selectedGrapeApp.id,
                        },
                      })
                      setShowGrapes(false)
                      setSelectedGrapeApp(undefined)
                      setIsPear(selectedGrapeApp)
                    }}
                    style={{}}
                  >
                    🍐 {t("Give Feedback with Pear")}
                  </Button>
                </Div>
              </Div>
            )}
          </Div>
        </Modal>
      )}
      <Button
        data-testid={dataTestId}
        // href={getAppSlug(grape)}
        title={t("Discover apps, earn credits")}
        // openInNewTab={isExtension && isFirefox}
        className="button transparent"
        style={{
          ...utilities.button.style,
          ...utilities.transparent.style,
          ...style,
        }}
        onClick={() => {
          if (goToGrape) {
            setIsNewAppChat({ item: grape })
            return
          }
          setShowGrapes(true)
          plausible({
            name: ANALYTICS_EVENTS.GRAPE_ICON_CLICK,
            props: {
              apps_available: grapes.length,
            },
          })
        }}
      >
        <Img showLoading={false} logo={"grape"} width={18} height={18} />
        {!goToGrape && grapes.length > 0 && (
          <Span
            style={{
              color: COLORS.purple,
              fontFamily: "var(--font-mono)",
              fontSize: ".7rem",
            }}
          >
            {grapes.length}
          </Span>
        )}
      </Button>
    </Div>
  )
}

export default Grapes
