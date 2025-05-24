import { create } from "zustand";

interface ChatStore {
  currentDiscussionId: number | null;
  setCurrentDiscussionId: (discussionId: number | null) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  currentDiscussionId: null,
  setCurrentDiscussionId: (discussionId) =>
    set({ currentDiscussionId: discussionId }),
}));

export default useChatStore;
