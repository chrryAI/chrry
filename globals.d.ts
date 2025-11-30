export {}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
  const __DEV__: boolean
  const browser:
    | {
        storage: {
          local: {
            get: (keys?: string | string[] | object) => Promise<any>
            set: (items: object) => Promise<void>
          }
          onChanged: {
            addListener: (callback: (changes: any) => void) => void
            removeListener: (callback: (changes: any) => void) => void
          }
        }
        runtime: {
          sendMessage: (message: any) => Promise<any>
          onMessage: {
            addListener: (
              callback: (message: any, sender: any, sendResponse: any) => void,
            ) => void
            removeListener: (
              callback: (message: any, sender: any, sendResponse: any) => void,
            ) => void
          }
        }
        notifications: {
          onClicked: {
            addListener: (callback: (notificationId: string) => void) => void
            removeListener: (callback: (notificationId: string) => void) => void
          }
          clear: (notificationId: string) => Promise<void>
        }
        tabs: {
          query: (queryInfo: object) => Promise<any>
          update: (tabId: number, updateProperties: object) => Promise<any>
          create: (createProperties: object) => Promise<any>
        }
        windows: {
          update: (windowId: number, updateInfo: object) => Promise<any>
        }
      }
    | undefined
}
