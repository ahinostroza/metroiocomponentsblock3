import React, { createContext, useContext, useState } from 'react'

import { ISteps } from '../interfaces/ISteps'
import { User } from '../interfaces/User'

interface ShopSelectContextData {
  currentStep: keyof ISteps
  setCurrentStep(step: keyof ISteps): void
  user?: User
  setUser(user: User | undefined): void
}

const ShopSelectContext = createContext<ShopSelectContextData>(
  {} as ShopSelectContextData
)

const ShopSelectProvider: React.FC = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<keyof ISteps>('email')
  const [user, setUser] = useState<User | undefined>()

  return (
    <ShopSelectContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        user,
        setUser,
      }}
    >
      {children}
    </ShopSelectContext.Provider>
  )
}

function useShopSelect(): ShopSelectContextData {
  const context = useContext(ShopSelectContext)

  if (!context) {
    throw new Error('useShopSelect must be used within an ShopSelectProvider')
  }

  return context
}

export { ShopSelectProvider, useShopSelect }
