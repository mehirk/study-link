import { create } from "zustand";
import {
  deleteComment,
  addComment as sendNewMessage,
  updateComment as updateMessage,
} from "@lib/api/discussion";
import useGroupStore from "./group-store";
import { createJSONStorage, persist } from "zustand/middleware";
import persistentStorage from "@lib/persistent-url-state";

interface ChatStore {
  currentDiscussionId: number | null;
  sendingComment: boolean;
  commentToEdit: number | null;
  commentToDelete: number | null;
  setCommentToDelete: (commentId: number | null) => void;
  setCommentToEdit: (commentId: number | null) => void;
  setCurrentDiscussionId: (discussionId: number | null) => void;
  setSendingComment: (sendingComment: boolean) => void;
  sendNewMessage: (message: string) => void;
  updateMessage: (message: string) => void;
  deleteComment: () => void;
}

interface PersistedChatState {
  currentDiscussionId: number | null;
}

const useChatStore = create(
  persist<ChatStore, [], [], PersistedChatState>(
    (set) => ({
      currentDiscussionId: null,
      sendingComment: false,
      commentToEdit: null,
      commentToDelete: null,

      setCommentToEdit: (commentId) => set({ commentToEdit: commentId }),

      setCommentToDelete: (commentId) => set({ commentToDelete: commentId }),

      setCurrentDiscussionId: (discussionId) =>
        set({ currentDiscussionId: discussionId }),

      setSendingComment: (sendingComment) =>
        set({ sendingComment: sendingComment }),

      sendNewMessage: async (message) => {
        set({ sendingComment: true });
        await sendNewMessage(
          useGroupStore.getState().currentGroupId!,
          useChatStore.getState().currentDiscussionId!,
          { content: message }
        );
        set({ sendingComment: false });
      },

      updateMessage: async (message) => {
        set({ sendingComment: true });
        await updateMessage(
          useGroupStore.getState().currentGroupId!,
          useChatStore.getState().currentDiscussionId!,
          useChatStore.getState().commentToEdit!,
          { content: message }
        );
        set({ sendingComment: false, commentToEdit: null });
      },

      deleteComment: async () => {
        await deleteComment(
          useGroupStore.getState().currentGroupId!,
          useChatStore.getState().currentDiscussionId!,
          useChatStore.getState().commentToDelete!
        );
        set({ sendingComment: false, commentToDelete: null });
      },
    }),
    {
      name: "chat",
      storage: createJSONStorage<PersistedChatState>(() => persistentStorage),
      partialize: (state): PersistedChatState => ({
        currentDiscussionId: state.currentDiscussionId,
      }),
    }
  )
);

export default useChatStore;
