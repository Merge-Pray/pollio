import { create } from "zustand";
import { persist } from "zustand/middleware";

// Typ für User
interface User {
  userID: string;
  username: string;
}

// Zustand und Aktionen
interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  clearUser: () => void;
}

// Custom Storage für Zustand Persist
const zustandStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

// Store definieren
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) =>
        set({ currentUser: { userID: user.userID, username: user.username } }),
      clearUser: () => set({ currentUser: null }),
    }),
    {
      name: "user-storage", // Key im localStorage
      storage: zustandStorage,
    }
  )
);

export default useUserStore;
