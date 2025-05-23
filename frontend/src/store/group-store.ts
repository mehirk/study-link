import { Group } from "@lib/api/group";
import { create } from "zustand";

interface GroupStore {
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const useGroupStore = create<GroupStore>((set) => ({
  currentGroup: null,
  setCurrentGroup: (group) => set({ currentGroup: group }),
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}));

export default useGroupStore;
