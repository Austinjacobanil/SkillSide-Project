import { create } from 'zustand'

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("skillside-theme") || "coffee",
    setTheme: (theme) => {
        localStorage.setItem("skillside-theme", theme);
        set({ theme });
    },
}))
