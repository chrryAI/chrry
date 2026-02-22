import { vi } from "vitest"

const defaultMockAuth = {
  user: { id: "user-1", name: "Test User", role: "user" },
  guest: null,
  token: "mock-token",
  threadId: "thread-1",
  threadIdRef: { current: "thread-1" },
  language: "en",
  showFocus: false,
  memoriesEnabled: true,
  grapes: [],
  app: { id: "app-1", name: "Test App" },
  baseApp: { id: "base-app-1", store: { apps: [] } },
  isRetro: false,
  dailyQuestionData: null,
  dailyQuestionIndex: 0,
  minimize: false,
  isIDE: false,
  burn: false,
  characterProfilesEnabled: true,
  characterProfiles: [] as Array<{
    id: string
    name: string
    [key: string]: any
  }>,
  showCharacterProfiles: false,
  isPear: false,
  taskId: null,
  canBurn: true,
  isProgramme: false,
  accountApps: [],
  lastApp: null,
  ask: null,
  about: null,
  postToTribe: false,
  postToMoltbook: false,
  moltPlaceHolder: [],
  canShowTribe: true,
}

export const mockAuth: any = {
  ...defaultMockAuth,
  setThreadId: vi.fn(),
  setUser: vi.fn(),
  setGuest: vi.fn(),
  plausible: vi.fn(),
  setShowFocus: vi.fn(),
  setIsRetro: vi.fn(),
  advanceDailySection: vi.fn(),
  setDailyQuestionIndex: vi.fn(),
  setShowCharacterProfiles: vi.fn(),
  setIsPear: vi.fn(),
  fetchTasks: vi.fn(),
  getAppSlug: vi.fn(),
  setShowGrapes: vi.fn(),
  setPostToTribe: vi.fn(),
  setPostToMoltbook: vi.fn(),

  reset: function () {
    Object.assign(this, defaultMockAuth)
    // Deep resets if needed
    this.threadIdRef = { ...defaultMockAuth.threadIdRef }
  },
}

const defaultMockChat = {
  aiAgents: [
    {
      id: "sushi",
      name: "sushi",
      displayName: "Sushi",
      capabilities: {
        text: true,
        image: true,
        pdf: true,
        audio: true,
        video: true,
        codeExecution: true,
        webSearch: true,
        imageGeneration: true,
      },
      state: "active",
      order: 1,
      creditCost: 1,
    },
    {
      id: "claude",
      name: "claude",
      displayName: "Claude",
      capabilities: { text: true },
      state: "active",
      order: 2,
      creditCost: 2,
    },
  ],
  selectedAgent: {
    id: "sushi",
    name: "sushi",
    displayName: "Sushi",
    capabilities: {
      text: true,
      image: true,
      pdf: true,
      audio: true,
      video: true,
      codeExecution: true,
      webSearch: true,
      imageGeneration: true,
    },
    state: "active",
    order: 1,
    creditCost: 1,
  },
  debateAgent: null,
  isDebating: false,
  isWebSearchEnabled: false,
  input: "",
  creditsLeft: 100,
  hourlyUsageLeft: 50,
  hitHourlyLimit: false,
  hourlyLimit: 100,
  isEmpty: false,
  isAgentModalOpen: false,
  isDebateAgentModalOpen: false,
  isImageGenerationEnabled: false,
  shouldFocus: false,
  isChatFloating: false,
  isNewChat: false,
  onlyAgent: false,
  showTribe: false,
  thread: { id: "thread-1", title: "Test Thread", messages: [] },
  messages: [],
  isLoading: false,
  isLoadingMore: false,
  until: null,
  error: null,
  status: 200,
  liked: false,
  placeHolderText: "",
}

export const mockChat: any = {
  ...defaultMockChat,
  setSelectedAgent: vi.fn(),
  setDebateAgent: vi.fn(),
  setIsChatFloating: vi.fn(),
  setIsWebSearchEnabled: vi.fn(),
  setInput: vi.fn(),
  setShouldGetCredits: vi.fn(),
  setIsAgentModalOpen: vi.fn(),
  setIsDebateAgentModalOpen: vi.fn(),
  setIsAgentModalOpenInternal: vi.fn(),
  setIsImageGenerationEnabled: vi.fn(),
  setShouldFocus: vi.fn(),
  setIsNewChat: vi.fn(),
  scrollToBottom: vi.fn(),
  setThread: vi.fn(),
  setMessages: vi.fn(),
  refetchThread: vi.fn(),
  setIsLoadingMore: vi.fn(),
  setUntil: vi.fn(),
  nextPage: vi.fn(),
  setLiked: vi.fn(),
  setShowTribe: vi.fn(),

  // Helper to reset state
  reset: function () {
    Object.assign(this, defaultMockChat)
    // Re-assign thread to deep copy to avoid reference sharing issues if mutated deeply
    this.thread = JSON.parse(JSON.stringify(defaultMockChat.thread))
    this.messages = []
  },
}

const defaultMockApp = {
  app: { id: "app-1", name: "Test App" },
  apps: [],
  slug: "test-app",
  suggestSaveApp: false,
  appStatus: { part: null },
  appFormWatcher: {
    name: "",
    title: "",
    capabilities: {},
    apiKeys: {},
    tools: [],
  },
  minimize: false,
  defaultExtends: [],
  isAgentModalOpen: false,
  tab: "settings",
}

export const mockApp: any = {
  ...defaultMockApp,
  saveApp: vi.fn(),
  setMinimize: vi.fn(),
  setAppStatus: vi.fn(),
  setIsAgentModalOpen: vi.fn(),
  setTab: vi.fn(),
  appForm: {
    register: vi.fn(),
    watch: vi.fn((key) => {
      if (key === "capabilities") return {}
      if (key === "apiKeys") return {}
      if (key === "tools") return []
      if (key === "extends") return []
      if (key === "visibility") return "private"
      return ""
    }),
    control: {
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      _names: {
        mount: new Set(),
        unmount: new Set(),
        array: new Set(),
        watch: new Set(),
      },
      _subjects: {
        watch: { next: vi.fn() },
        array: { next: vi.fn() },
        state: { next: vi.fn() },
      },
      _getWatch: vi.fn(),
      _formValues: {},
      _defaultValues: {},
    },
    setValue: vi.fn(),
    formState: { errors: {} },
    handleSubmit: vi.fn((fn) => fn),
    reset: vi.fn(),
  },

  // Helper to reset state
  reset: function () {
    Object.assign(this, defaultMockApp)
  },
}

const defaultMockNavigation = {
  isShowingCollaborate: false,
  collaborationStep: 0,
  pathname: "/chat",
  searchParams: new URLSearchParams(),
  isVisitor: false,
  collaborationStatus: null,
  threads: [],
  slug: "test-app",
  burn: false,
  tab: null,
}

export const mockNavigation: any = {
  ...defaultMockNavigation,
  router: { push: vi.fn(), replace: vi.fn(), back: vi.fn() },
  setCollaborationStep: vi.fn(),
  addParams: vi.fn(),
  removeParams: vi.fn(),
  setIsNewChat: vi.fn(),
  setCollaborationStatus: vi.fn(),
  goToThreads: vi.fn(),
  refetchThreads: vi.fn(),
  goToCalendar: vi.fn(),
  setTab: vi.fn(),

  reset: function () {
    Object.assign(this, defaultMockNavigation)
  },
}

export const mockPlatform = {
  device: "desktop",
  os: "macos",
  isStandalone: false,
  isExtension: false,
  viewPortWidth: 1024,
  isWeb: true,
  isCapacitor: false,
  isIDE: false,
  platform: {
    isWeb: true,
    isNative: false,
    isIOS: false,
    isAndroid: false,
  },
}

export const mockTheme: any = {
  addHapticFeedback: vi.fn(),
  playNotification: vi.fn(),
  isDrawerOpen: false,
  isSmallDevice: false,
  isMobileDevice: false,
  reduceMotion: false,
}

export const mockData: any = {
  weather: null,
  actions: { updateGuest: vi.fn() },
}

export const mockAppContext = {
  t: (key: string, options?: any) => key,
  console: console,
}

export const mockStyles = {
  utilities: {
    link: { style: {} },
    xSmall: { style: {} },
    button: { style: {} },
    transparent: { style: {} },
    small: { style: {} },
    inverted: { style: {} },
    row: { style: {} },
    right: { style: {} },
    column: { style: {} },
  },
  appStyles: {},
  skeletonStyles: {},
  storeStyles: {},
}
