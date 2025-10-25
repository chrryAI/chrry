// Browser extension API type declarations
// This allows TypeScript to recognize the 'browser' global variable

declare const browser:
  | {
      runtime?: {
        id?: string
        getURL?: (path: string) => string
        sendMessage: (message: any, options?: any) => Promise<any> | void
      }
      cookies?: {
        get: (details: { url: string; name: string }) => Promise<any>
        set: (details: {
          url: string
          name: string
          value: string
          expirationDate?: number
        }) => Promise<any>
        remove: (details: { url: string; name: string }) => Promise<any>
        getAll: (details: { url: string }) => Promise<any[]>
      }
      storage: {
        local?: {
          get: (keys?: string | string[] | null) => Promise<any>
          set: (items: Record<string, any>) => Promise<void>
          remove: (keys: string | string[]) => Promise<void>
          clear: () => Promise<void>
        }
        onChanged: {
          addListener: (
            callback: (
              changes: Record<
                string,
                {
                  newValue?: any
                  oldValue?: any
                }
              >,
              areaName?: string,
            ) => void,
          ) => void
          removeListener: (
            callback: (
              changes: Record<
                string,
                {
                  newValue?: any
                  oldValue?: any
                }
              >,
              areaName?: string,
            ) => void,
          ) => void
        }
      }
      identity?: any
    }
  | undefined
