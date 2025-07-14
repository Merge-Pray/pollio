import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
}

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  clearUser: () => void;
  checkToken: () => void;
}

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

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => {
        if (user) {
          set({
            currentUser: { id: user.id, username: user.username },
          });
        } else {
          set({ currentUser: null });
        }
      },
      clearUser: () => set({ currentUser: null }),
      checkToken: async () => {
        try {
          const response = await fetch(`${process.env.VITE_BACKENDPATH}/user/${id}`, {
            method: "GET",
            credentials: "include",
          });
          if (response.ok) {
            const user = await response.json();
            set({ currentUser: user });
          } else {
            set({ currentUser: null });
          }
        } catch (error) {
          console.error("Error checking token:", error);
          set({ currentUser: null });
        }
      },
    }),
    {
      name: "user-storage",
      storage: zustandStorage,
    }
  )
);

export default useUserStore;
