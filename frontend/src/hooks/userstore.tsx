import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_URL } from "@/lib/config";

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
    (set, get) => ({
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
          const currentUser = get().currentUser;

          if (!currentUser) {
            set({ currentUser: null });
            return;
          }

          const response = await fetch(
            `${API_URL}/api/user/${currentUser.id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

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
