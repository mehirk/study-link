import { fetchUserGroups, Group } from "@lib/api/group";
import { create } from "zustand";

interface GroupStore {
  groups: Group[];
  currentGroup: Group | null;
  isAdmin: boolean;
  setCurrentGroup: (group: Group | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  fetchGroups: () => Promise<void>;
}

const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  currentGroup: null,
  setCurrentGroup: (group) => set({ currentGroup: group }),
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  fetchGroups: async () => {
    const groups = await fetchUserGroups();
    set({ groups });
  },
}));

export default useGroupStore;
