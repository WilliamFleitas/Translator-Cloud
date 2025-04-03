import React, { createContext, useState } from 'react'

interface DeepgramProviderProps {
  children: React.ReactNode
}
interface DefaultStateType {
  APIKey: string
}

interface DeepgramSettingsContextType {
  deepgramSettingsState: DefaultStateType
  updateDeepgramSettingsState: (key: string) => void
}
const defaultState: DeepgramSettingsContextType = {
  deepgramSettingsState: { APIKey: '' },
  updateDeepgramSettingsState: () => {}
}
const DeepgramSettingsStatusContext = createContext<DeepgramSettingsContextType>(defaultState)

const DeepgramSettingsContext: React.FC<DeepgramProviderProps> = ({ children }) => {
  const [state, setState] = useState<DefaultStateType>(defaultState.deepgramSettingsState)

  const updateDeepgramSettingsState = (key: string): void => {
    setState({ APIKey: key })
  }

  return (
    <DeepgramSettingsStatusContext.Provider
      value={{ deepgramSettingsState: state, updateDeepgramSettingsState }}
    >
      {children}
    </DeepgramSettingsStatusContext.Provider>
  )
}

export { DeepgramSettingsContext, DeepgramSettingsStatusContext }
