import { createContext, useContext, useState } from 'react'

const CityContext = createContext(null)

export function CityProvider({ children }) {
  const [city, setCity] = useState(() => localStorage.getItem('selectedCity') || '')
  const [showSelector, setShowSelector] = useState(false)

  const selectCity = (name) => {
    setCity(name)
    localStorage.setItem('selectedCity', name)
    setShowSelector(false)
  }

  return (
    <CityContext.Provider value={{ city, selectCity, showSelector, setShowSelector }}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = () => useContext(CityContext)
