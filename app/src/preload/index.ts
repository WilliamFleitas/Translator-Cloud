import { contextBridge, ipcRenderer } from 'electron'

interface AudioDeviceDataType {
  name: string
  id: number
}

interface DefaultAudioDeviceType {
  name: string
  id: string
}

export interface CheckVoicemeeterIsRunningType {
  active?: boolean
  message: string
}

interface VCSettingsStatusType {
  strip_A1: boolean
  strip_B1: boolean
  bus_0_name: string
}

interface SetVCSetupType {
  device_name: string
  message: string
}

export interface StartStreamingType {
  status: 0 | 1 | 2
  sentence?: string
  words?: { word: string }[]
  channel_info?: {
    is_final: boolean
    speech_final: boolean
    from_finalize: boolean
  }
  message?: string
}

export type DeviceType = 'speaker' | 'mic'
export type DurationTimeType = 'unlimited' | '60' | '600' | '1800' | '3600'

export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

export interface Api {
  startStreaming: (
    device: DeviceType,
    durationTime: DurationTimeType,
    audio_language: string,
    translation_language: string,
    deepgram_key: string | undefined,
    subsKey: string | undefined,
    region: string | undefined
  ) => Promise<ApiResponse<StartStreamingType>>
  stopStreaming: () => Promise<ApiResponse<{ status: string }>>
  getAudioDevices: () => Promise<ApiResponse<AudioDeviceDataType[]>>
  getDefaultAudioDevice: () => Promise<ApiResponse<DefaultAudioDeviceType>>
  getVoicemeeterApiCalls: (
    queryType: 'isRunning' | 'open' | 'close'
  ) => Promise<ApiResponse<CheckVoicemeeterIsRunningType>>
  getVCSettingsStatus: () => Promise<ApiResponse<VCSettingsStatusType>>
  setVCSetup: (device_name: string) => Promise<ApiResponse<SetVCSetupType>>
  getTranslation: (
    transcription: string,
    audio_language: string,
    translation_language: string,
    subsKey: string | undefined,
    region: string | undefined
  ) => Promise<ApiResponse<{ translation: string }>>
  setClickableOverlay: (enableOverlay: boolean) => void

  handleTranslationOverlay: (enableOverlay: boolean) => void

  on: (event: string, listener: (event: Electron.IpcRendererEvent, data: any) => void) => void
  removeListener: (
    event: string,
    listener: (event: Electron.IpcRendererEvent, data: any) => void
  ) => void
  windowControls: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
}

const api: Api = {
  startStreaming: async (
    device,
    durationTime,
    audio_language,
    translation_language,
    deepgram_key,
    subsKey,
    region
  ) => {
    return await ipcRenderer.invoke(
      'start-streaming',
      device,
      durationTime,
      audio_language,
      translation_language,
      deepgram_key,
      subsKey,
      region
    )
  },
  stopStreaming: async () => {
    return await ipcRenderer.invoke('stop-streaming')
  },
  getAudioDevices: async () => {
    return await ipcRenderer.invoke('find-audio-devices')
  },
  getDefaultAudioDevice: async () => {
    return await ipcRenderer.invoke('find_default_audio_device')
  },
  getVoicemeeterApiCalls: async (queryType) => {
    return await ipcRenderer.invoke('voicemeeter-api-calls', queryType)
  },
  getVCSettingsStatus: async () => {
    return await ipcRenderer.invoke('get_VC_settings_status')
  },
  setVCSetup: async (device_name) => {
    return await ipcRenderer.invoke('set_VC_setup', device_name)
  },
  getTranslation: async (transcription, audio_language, translation_language, subsKey, region) => {
    return await ipcRenderer.invoke(
      'get-translation',
      transcription,
      audio_language,
      translation_language,
      subsKey,
      region
    )
  },
  setClickableOverlay: (enableOverlay: boolean) => {
    ipcRenderer.invoke('clickable-overlay', enableOverlay)
  },

  handleTranslationOverlay: (enableOverlay) => {
    ipcRenderer.send('toggle-overlay', enableOverlay)
  },
  on: (event, listener) => {
    ipcRenderer.on(event, listener)
  },
  removeListener: (event, listener) => {
    ipcRenderer.removeListener(event, listener)
  },
  windowControls: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  // window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
