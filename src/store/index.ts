import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import slidesReducer, { DEFAULT_THEME } from "@/store/slices/slidesSlice";
import userReducer from "@/store/slices/userSlice";

const rootReducer = combineReducers({
  slides: slidesReducer,
  user: userReducer,
});

// Migration function to fix persisted state structure
const migrate = async (state: any): Promise<any> => {
  // Ensure slides have rows array
  if (state?.slides?.slides) {
    state.slides.slides = state.slides.slides.map((slide: any) => {
      if (!slide.rows || !Array.isArray(slide.rows)) {
        return {
          ...slide,
          rows: slide.rows || [],
        };
      }
      return slide;
    });
  }
  // Ensure theme exists
  if (state?.slides && !state.slides.theme) {
    state.slides.theme = DEFAULT_THEME;
  }
  // Migrate old fontFamily format to new format
  if (state?.slides?.theme?.fontFamily) {
    const fontFamily = state.slides.theme.fontFamily;
    // If it's the old format with commas, extract just the font name
    if (fontFamily.includes(",")) {
      const fontName = fontFamily.split(",")[0].trim();
      // Map common font names
      const fontMap: Record<string, string> = {
        "Inter": "Inter",
        "Roboto": "Roboto",
        "Open Sans": "Open Sans",
        "Lato": "Lato",
        "Montserrat": "Montserrat",
        "Poppins": "Poppins",
        "Playfair Display": "Playfair Display",
        "Merriweather": "Merriweather",
      };
      state.slides.theme.fontFamily = fontMap[fontName] || "Inter";
    }
  }
  return Promise.resolve(state);
};

// Redux Persist configuration
const persistConfig = {
  key: "root",
  version: 2, // Increment version to trigger migration
  storage,
  migrate,
  // Optionally, you can whitelist or blacklist specific reducers
  // whitelist: ['slides'], // only persist slides reducer
  // blacklist: ['user'], // don't persist user reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Extract types from rootReducer to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
