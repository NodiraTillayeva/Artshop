import { createContext, useContext, useReducer } from 'react';

const BoothStateContext = createContext(null);
const BoothDispatchContext = createContext(null);

const initialState = {
  prints: [],
  keychains: [],
  stickers: [],
  tshirts: [
    {
      id: 'default-longsleeve',
      name: 'Long Sleeve Mockup',
      dataUrl: null,
      modelUrl: '/models/long_sleeve.glb',
    },
  ],
  stickerSheets: [],
  selectedItem: null, // { type: 'print' | 'keychain' | 'sticker' | 'stickerSheet' | 'tshirt', id }
  activeSection: 'overview',
};

function boothReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRINT':
      return { ...state, prints: [...state.prints, action.payload] };
    case 'REMOVE_PRINT':
      return {
        ...state,
        prints: state.prints.filter((p) => p.id !== action.payload),
        selectedItem:
          state.selectedItem?.id === action.payload ? null : state.selectedItem,
      };
    case 'ADD_KEYCHAIN':
      return { ...state, keychains: [...state.keychains, action.payload] };
    case 'REMOVE_KEYCHAIN':
      return {
        ...state,
        keychains: state.keychains.filter((k) => k.id !== action.payload),
        selectedItem:
          state.selectedItem?.id === action.payload ? null : state.selectedItem,
      };
    case 'ADD_STICKER':
      return { ...state, stickers: [...state.stickers, action.payload] };
    case 'REMOVE_STICKER':
      return {
        ...state,
        stickers: state.stickers.filter((s) => s.id !== action.payload),
        selectedItem:
          state.selectedItem?.id === action.payload ? null : state.selectedItem,
      };
    case 'ADD_STICKER_SHEET':
      return { ...state, stickerSheets: [...state.stickerSheets, action.payload] };
    case 'REMOVE_STICKER_SHEET':
      return {
        ...state,
        stickerSheets: state.stickerSheets.filter((s) => s.id !== action.payload),
        selectedItem:
          state.selectedItem?.id === action.payload ? null : state.selectedItem,
      };
    case 'ADD_TSHIRT':
      return { ...state, tshirts: [...state.tshirts, action.payload] };
    case 'REMOVE_TSHIRT':
      return {
        ...state,
        tshirts: state.tshirts.filter((t) => t.id !== action.payload),
        selectedItem:
          state.selectedItem?.id === action.payload ? null : state.selectedItem,
      };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'DESELECT_ITEM':
      return { ...state, selectedItem: null };
    case 'SET_SECTION':
      return { ...state, activeSection: action.payload };
    default:
      return state;
  }
}

export function BoothProvider({ children }) {
  const [state, dispatch] = useReducer(boothReducer, initialState);
  return (
    <BoothStateContext.Provider value={state}>
      <BoothDispatchContext.Provider value={dispatch}>
        {children}
      </BoothDispatchContext.Provider>
    </BoothStateContext.Provider>
  );
}

export function useBoothState() {
  const ctx = useContext(BoothStateContext);
  if (!ctx) throw new Error('useBoothState must be used within BoothProvider');
  return ctx;
}

export function useBoothDispatch() {
  const ctx = useContext(BoothDispatchContext);
  if (!ctx)
    throw new Error('useBoothDispatch must be used within BoothProvider');
  return ctx;
}
