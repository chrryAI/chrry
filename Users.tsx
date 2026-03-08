"use client"

import clsx from "clsx"
import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import Collaborate from "./Collaborate"
import { useAppContext } from "./context/AppContext"
import { useAuth, useData, useNavigationContext } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { useWindowHistory } from "./hooks/useWindowHistory"
import Img from "./Img"
import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  LoaderCircle,
  Sparkles,
  UsersRound,
} from "./icons"
import Loading from "./Loading"
import { A, Button, Div, H1, P } from "./platform"
import Search from "./Search"
import Skeleton from "./Skeleton"
import type { characterProfile, user } from "./types"
import { useUsersStyles } from "./Users.styles"
import { pageSizes } from "./utils"

const Users = ({ style }: { style?: React.CSSProperties }) => {
  const styles = useUsersStyles()
  const { utilities } = useStyles()
  const [until, setUntil] = useState<number>(1)
  const { token } = useAuth()
  const { t } = useAppContext()
  const { router, searchParams } = useNavigationContext()
  const [find, setFind] = useState(searchParams?.get("find") || "")

  const { router: historyRouter } = useWindowHistory()

  const [similarTo, setSimilarTo] = useState<string | undefined>(
    searchParams?.get("similarTo") || undefined,
  )

  const [hasNextPage, setHasNextPage] = useState(false)

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    if (!searchParams) return

    const to = searchParams.get("similarTo")
    if (to && to !== similarTo) {
      setSimilarTo(to)
      setSelectedCharacterProfileId(to)
    }

    const findParam = searchParams.get("find")
    if (findParam && findParam !== find) {
      setFind(findParam)
    }
  }, [searchParams, similarTo, find])

  const [selectedCharacterProfileId, setSelectedCharacterProfileId] = useState<
    string | undefined
  >(undefined)

  const { actions } = useData()

  const [users, setUsers] = useState<
    (user & { characterProfiles: characterProfile[] })[]
  >([])
  const { data: usersData, error } = useSWR(
    token ? ["users", until, find, similarTo] : null,
    () => {
      if (!token) return

      return actions.getUsers({
        pageSize: pageSizes.users * until,
        find,
        similarTo,
      })
    },
  )

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (usersData) {
      setIsLoading(false)
    }
    if (usersData?.users && Array.isArray(usersData.users.users)) {
      setUsers(usersData.users.users)
      setHasNextPage(usersData.users.hasNextPage)
    }
  }, [usersData])

  useEffect(() => {
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    }
  }, [error])

  return (
    <Skeleton>
      <Div style={{ ...styles.users.style, ...style }}>
        <H1 style={{ ...styles.usersTitle.style }}>
          <UsersRound size={26} /> {t("Users")}
        </H1>
        <Search
          paramName="find"
          dataTestId="threads-search"
          className={clsx(styles.searchInput)}
          placeholder={t("Search users...")}
          scroll={false}
          onChange={(search) => {
            setFind(search)
            const url = new URL(window.location.href)
            if (search) {
              url.searchParams.set("find", search)
            } else {
              url.searchParams.delete("find")
            }
            router.push(url.pathname + url.search)
          }}
        />
        {isLoading && !isLoadingMore && !find ? (
          <Div style={{ ...styles.loadingContainer.style }}>
            <Loading />
          </Div>
        ) : (
          <Div style={{ ...styles.usersContainer.style }}>
            {users?.length === 0 && <P>{t("Nothing here yet")}</P>}
            {users?.map((user) => (
              <Div style={{ ...styles.usersItem.style }} key={user.id}>
                <Div style={{ ...styles.usersItemUser.style }}>
                  <Div style={{ ...styles.usersItemUserImage.style }}>
                    {user.image ? (
                      <Img
                        src={user.image}
                        alt={user.name!}
                        width={26}
                        height={26}
                        style={{ ...styles.profileImage.style }}
                      />
                    ) : (
                      <CircleUserRound size={26} />
                    )}
                    <A
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/u/${user.userName}`)
                      }}
                    >
                      {user.name}
                    </A>
                  </Div>
                  <Collaborate withUser={user} />
                </Div>
                <Div style={{ ...styles.usersItemCharacterProfiles.style }}>
                  {(() => {
                    const characterProfile =
                      user.characterProfiles.find(
                        (characterProfile) =>
                          characterProfile.id === selectedCharacterProfileId,
                      ) || user.characterProfiles?.[0]
                    if (!characterProfile) return null

                    const currentIndex =
                      user.characterProfiles.indexOf(characterProfile)

                    const nextCharacterProfile =
                      user.characterProfiles[currentIndex + 1]

                    const previousCharacterProfile =
                      user.characterProfiles[currentIndex - 1]

                    return (
                      <>
                        <Div
                          style={{ ...styles.usersItemCharacterProfile.style }}
                        >
                          <A
                            key={characterProfile.id}
                            onClick={(e) => {
                              e.preventDefault()

                              historyRouter.push(
                                `/u?similarTo=${characterProfile.id}`,
                              )
                            }}
                            className="button inverted"
                            style={{
                              ...utilities.button.style,
                              ...utilities.inverted.style,
                            }}
                            href={`/u?similarTo=${characterProfile.id}`}
                          >
                            <Sparkles
                              size={16}
                              color="var(--accent-1)"
                              fill="var(--accent-1)"
                            />
                            {characterProfile.name}
                          </A>
                          {previousCharacterProfile && (
                            <Button
                              className="link"
                              style={{ ...utilities.link.style }}
                              onClick={() => {
                                setSelectedCharacterProfileId(
                                  previousCharacterProfile.id,
                                )
                              }}
                            >
                              <ArrowLeft size={18} />
                            </Button>
                          )}
                          {nextCharacterProfile && (
                            <Button
                              className="link"
                              style={{ ...utilities.link.style }}
                              onClick={() => {
                                setSelectedCharacterProfileId(
                                  nextCharacterProfile.id,
                                )
                              }}
                            >
                              <ArrowRight size={18} />
                            </Button>
                          )}
                        </Div>
                        <Div style={{ ...styles.tags.style }}>
                          {characterProfile.tags?.join(", ")}
                        </Div>
                      </>
                    )
                  })()}
                </Div>
              </Div>
            ))}
          </Div>
        )}

        {hasNextPage && (
          <Div
            style={{
              ...styles.loadMoreButtonContainer.style,
              ...utilities.transparent.style,
            }}
          >
            <Button
              onClick={() => {
                setIsLoadingMore(true)
                setUntil(until + 1)
              }}
              style={{ ...styles.loadMoreButton }}
              className={"transparent"}
            >
              <LoaderCircle size={18} />
              {t("Load more")}
            </Button>
          </Div>
        )}
      </Div>
    </Skeleton>
  )
}

export default Users
