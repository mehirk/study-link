import type { Group, GroupMember } from "@lib/api/group";
import { create } from "zustand";
import useAuthStore from "./auth-store";
import { createJSONStorage, persist } from "zustand/middleware";
import persistentStorage from "@lib/persistent-url-state";

interface GroupStore {
  currentGroupId: number | null;
  currentGroup: Omit<Group, "members"> | null;
  isAdmin: boolean;
  activeTab: string;
  setCurrentGroup: (group: Omit<Group, "members"> | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setActiveTab: (tab: string) => void;
  updateAdminStatus: (members: GroupMember[]) => void;
}

interface PersistedGroupState {
  currentGroupId: number | null;
  activeTab: string;
}

const useGroupStore = create(
  persist<GroupStore, [], [], PersistedGroupState>(
    (set, get) => ({
      currentGroupId: null,
      currentGroup: null,
      activeTab: "discussions" as const,
      isAdmin: false,

      setCurrentGroup: (group) => {
        set({ currentGroup: group, currentGroupId: group?.id ?? null });
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
    }),
    {
      name: "group",
      storage: createJSONStorage<PersistedGroupState>(() => persistentStorage),
      partialize: (state): PersistedGroupState => ({
        currentGroupId: state.currentGroupId,
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useGroupStore;
