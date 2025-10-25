"use client"

import React, { useEffect, useState } from "react"
import styles from "./Users.module.scss"
import Skeleton from "./Skeleton"
import clsx from "clsx"
import useSWR from "swr"
import { getUsers } from "./lib"
import { useAppContext } from "./context/AppContext"
import { useLocalStorage } from "./hooks"
import {
  BrowserInstance,
  checkIsExtension,
  FRONTEND_URL,
  pageSizes,
} from "./utils"
import { user, characterProfile } from "./types"
import Search from "./Search"
import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  LoaderCircle,
  Sparkles,
  UsersRound,
} from "./icons"
import Img from "./Img"
import { useWindowHistory } from "./hooks/useWindowHistory"
import Loading from "./Loading"
import toast from "react-hot-toast"
import Collaborate from "./Collaborate"
import { useAuth, useData, useNavigationContext } from "./context/providers"

const Users = ({ className }: { className?: string }) => {
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
      <div className={clsx(styles.users, className)}>
        <h1 className={clsx(styles.usersTitle)}>
          <UsersRound size={26} /> {t("Users")}
        </h1>
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
          <div className={clsx(styles.loadingContainer)}>
            <Loading />
          </div>
        ) : (
          <div className={clsx(styles.usersContainer)}>
            {users?.length === 0 && (
              <p className={clsx(styles.noUsers)}>{t("Nothing here yet")}</p>
            )}
            {users?.map((user) => (
              <div className={styles.usersItem} key={user.id}>
                <div className={styles.usersItemUser}>
                  <div className={styles.usersItemUserImage}>
                    {user.image ? (
                      <Img
                        src={user.image}
                        alt={user.name!}
                        width={26}
                        height={26}
                        className={styles.profileImage}
                      />
                    ) : (
                      <CircleUserRound size={26} />
                    )}
                    <a
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/u/${user.userName}`)
                      }}
                    >
                      {user.name}
                    </a>
                  </div>
                  <Collaborate withUser={user} />
                </div>
                <div className={styles.usersItemCharacterProfiles}>
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
                        <div className={styles.usersItemCharacterProfile}>
                          <a
                            key={characterProfile.id}
                            onClick={(e) => {
                              e.preventDefault()

                              historyRouter.push(
                                `/u?similarTo=${characterProfile.id}`,
                              )
                            }}
                            className="button inverted"
                            href={`/u?similarTo=${characterProfile.id}`}
                          >
                            <Sparkles
                              size={16}
                              color="var(--accent-1)"
                              fill="var(--accent-1)"
                            />
                            {characterProfile.name}
                          </a>
                          {previousCharacterProfile && (
                            <button
                              className="link"
                              onClick={(e) => {
                                e.preventDefault()

                                setSelectedCharacterProfileId(
                                  previousCharacterProfile.id,
                                )
                              }}
                            >
                              <ArrowLeft size={18} />
                            </button>
                          )}
                          {nextCharacterProfile && (
                            <button
                              className="link"
                              onClick={(e) => {
                                e.preventDefault()

                                setSelectedCharacterProfileId(
                                  nextCharacterProfile.id,
                                )
                              }}
                            >
                              <ArrowRight size={18} />
                            </button>
                          )}
                        </div>
                        <div className={styles.tags}>
                          {characterProfile.tags?.join(", ")}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className={clsx(styles.loadMoreButtonContainer)}>
            <button
              onClick={() => {
                setIsLoadingMore(true)
                setUntil(until + 1)
              }}
              className={clsx("transparent", styles.loadMoreButton)}
            >
              <LoaderCircle size={18} />
              {t("Load more")}
            </button>
          </div>
        )}
      </div>
    </Skeleton>
  )
}

export default Users
