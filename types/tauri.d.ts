/**
 * Tauri API type declarations
 * This provides TypeScript support for window.__TAURI__ API
 */

interface TauriWindow {
  getCurrent(): {
    close(): Promise<void>
    minimize(): Promise<void>
    maximize(): Promise<void>
    unmaximize(): Promise<void>
    isMaximized(): Promise<boolean>
    toggleMaximize(): Promise<void>
    setTitle(title: string): Promise<void>
    setResizable(resizable: boolean): Promise<void>
    setFullscreen(fullscreen: boolean): Promise<void>
  }
}

interface TauriAPI {
  window: TauriWindow
  event: any
  invoke: (cmd: string, args?: any) => Promise<any>
}

declare global {
  interface Window {
    __TAURI__?: TauriAPI
  }
}

export {}
