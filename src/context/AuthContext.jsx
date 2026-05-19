import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const initialState = {
  user: JSON.parse(localStorage.getItem('dms_user')) || null,
  theme: localStorage.getItem('dms_theme') || 'light',
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('dms_user', JSON.stringify(action.payload))
      return { ...state, user: action.payload }
    case 'LOGOUT':
      localStorage.removeItem('dms_user')
      localStorage.removeItem('dms_token')
      return { ...state, user: null }
    case 'TOGGLE_THEME':
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('dms_theme', next)
      return { ...state, theme: next }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = (userData) => dispatch({ type: 'LOGIN', payload: userData })
  const logout = () => dispatch({ type: 'LOGOUT' })
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' })

  useEffect(() => {
    document.body.style.background = state.theme === 'dark' ? '#1a0a0f' : ''
    document.body.style.color = state.theme === 'dark' ? '#fce7f3' : ''
  }, [state.theme])

  return (
    <AuthContext.Provider value={{ user: state.user, theme: state.theme, login, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)