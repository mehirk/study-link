import type { Group, GroupMember } from "@lib/api/group";
import { create } from "zustand";
import useAuthStore from "./auth-store";

interface GroupStore {
  currentGroup: Group | null;
  isAdmin: boolean;
  activeTab: string;
  setCurrentGroup: (group: Group | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setActiveTab: (tab: string) => void;
  updateAdminStatus: (members: GroupMember[]) => void;
}

const useGroupStore = create<GroupStore>((set, get) => ({
  currentGroup: null,
  activeTab: "discussions",
  isAdmin: false,

  setCurrentGroup: (group) => {
    set({ currentGroup: group });
  },

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateAdminStatus: (members) => {
    const currentGroup = get().currentGroup;
    const user = useAuthStore.getState().user;

    if (!currentGroup || !user || members.length === 0) {
      set({ isAdmin: false });
      return;
    }

    const isAdmin = members.some(
      (member) =>
        String(member.userId) === String(user.id) && member.role === "ADMIN"
    );

    set({ isAdmin });
  },
}));

export default useGroupStore;
