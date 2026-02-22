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
          id?: string
          getURL?: (path: string) => string
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
        cookies?: {
          get: (details: { url: string; name: string }) => Promise<any>
          getAll: (details: { url: string }) => Promise<any[]>
          remove: (details: { url: string; name: string }) => Promise<any>
        }
        identity?: any
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

  interface ImportMetaEnv {
    readonly VITE_SITE_MODE?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
