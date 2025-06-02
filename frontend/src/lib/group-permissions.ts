import type { User } from "better-auth/types";

// Simple interface that matches what we actually use in the component
export interface GroupMember {
  id: number;
  userId: string;
  role: "ADMIN" | "MEMBER";
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export const canRemoveMember = (
  currentUser: User | null,
  member: GroupMember,
  isCurrentUserAdmin: boolean
): boolean => {
  if (!currentUser || !isCurrentUserAdmin) return false;
  return member.id !== Number(currentUser.id) && member.role === "MEMBER";
};

export const canPromoteToAdmin = (
  currentUser: User | null,
  member: GroupMember,
  isCurrentUserAdmin: boolean
): boolean => {
  if (!currentUser || !isCurrentUserAdmin) return false;
  return member.id !== Number(currentUser.id) && member.role === "MEMBER";
};

export const canLeaveGroup = (
  currentUser: User | null,
  member: GroupMember
): boolean => {
  if (!currentUser) return false;
  return member.userId === currentUser.id && member.role === "MEMBER";
};

export const isCurrentUser = (
  currentUser: User | null,
  member: GroupMember
): boolean => {
  if (!currentUser) return false;
  return member.id === Number(currentUser.id);
};
