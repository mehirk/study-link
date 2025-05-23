import type { Group } from "@lib/api/group";
import { create } from "zustand";

interface GroupStore {
  currentGroup: Group | null;
  isAdmin: boolean;
  setCurrentGroup: (group: Group | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

const useGroupStore = create<GroupStore>((set) => ({
  currentGroup: null,
  setCurrentGroup: (group) => set({ currentGroup: group }),
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}));

export default useGroupStore;
