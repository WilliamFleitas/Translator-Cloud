import { IpcRendererEvent } from 'electron'

export interface DefaultAudioDeviceType {
  name: string
  id: string
}

export interface CheckVoicemeeterIsRunningType {
  active?: boolean
  message: string
}

export interface VCSettingsStatusType {
  strip_A1: boolean
  strip_B1: boolean
  bus_0_name: string
}

export interface SetVCSetupType {
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
  getAudioDevices: () => Promise<ApiResponse<DefaultAudioDeviceType[]>>
  setVoicemeeterOutput: (deviceName: string, deviceIndex: number) => Promise<ApiResponse<string>>
  getDefaultAudioDevice: () => Promise<ApiResponse<DefaultAudioDeviceType>>
  getVoicemeeterApiCalls: (
    queryType: 'isRunning' | 'open' | 'close'
  ) => Promise<ApiResponse<CheckVoicemeeterIsRunningType>>
  getVCSettingsStatus: () => Promise<ApiResponse<VCSettingsStatusType>>
  setVCSetup: (device_name: string) => Promise<ApiResponse<SetVCSetupType>>
  getTranslation: (
    transcription: string,
    audio_language: AudioLanguageType,
    translation_language: string,
    subsKey: string | undefined,
    region: string | undefined
  ) => Promise<ApiResponse<{ translation: string }>>

  handleTranslationOverlay: (enableOverlay: boolean) => void
  setClickableOverlay: (enableOverlay: boolean) => void

  on: (event: string, listener: (event: IpcRendererEvent, data: any) => void) => void
  removeListener: (event: string, listener: (event: IpcRendererEvent, data: any) => void) => void
  windowControls: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
}

declare global {
  interface Window {
    api: Api
  }
}
