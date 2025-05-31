import { create } from "zustand";
import {
  deleteComment,
  addComment as sendNewMessage,
  updateComment as updateMessage,
} from "@lib/api/discussion";
import useGroupStore from "./group-store";

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

const useChatStore = create<ChatStore>((set) => ({
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
      useGroupStore.getState().currentGroup!.id,
      useChatStore.getState().currentDiscussionId!,
      { content: message }
    );
    set({ sendingComment: false });
  },
  updateMessage: async (message) => {
    set({ sendingComment: true });
    await updateMessage(
      useGroupStore.getState().currentGroup!.id,
      useChatStore.getState().currentDiscussionId!,
      useChatStore.getState().commentToEdit!,
      { content: message }
    );
    set({ sendingComment: false });
  },
  deleteComment: async () => {
    await deleteComment(
      useGroupStore.getState().currentGroup!.id,
      useChatStore.getState().currentDiscussionId!,
      useChatStore.getState().commentToDelete!
    );
    set({ commentToDelete: null });
  },
}));

export default useChatStore;
