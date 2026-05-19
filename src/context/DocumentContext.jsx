import { createContext, useContext, useReducer } from 'react'

const DocumentContext = createContext(null)

const initialState = {
  documents: [],
  loading: false,
}

function documentReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload, loading: false }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] }
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(d =>
          d.id === action.payload.id ? action.payload : d
        )
      }
    default:
      return state
  }
}

export function DocumentProvider({ children }) {
  const [state, dispatch] = useReducer(documentReducer, initialState)
  return (
    <DocumentContext.Provider value={{ state, dispatch }}>
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocuments = () => useContext(DocumentContext)