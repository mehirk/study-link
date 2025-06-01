import { apiClient } from "@lib/api-client";

export interface Group {
  id: number;
  name: string;
  description: string | null;
  private: boolean;
  password: string | null;
  createdAt: string | number;
  updatedAt: string | number;
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  private?: boolean;
  password?: string;
}

export interface GroupMember {
  id: number;
  userId: string;
  groupId: number;
  role: "ADMIN" | "MEMBER";
  joinedAt: string | number;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}
// Fetch all groups the user is a member of
export const fetchUserGroups = async (): Promise<Omit<Group, "members">[]> => {
  const response = await apiClient.get("/groups");
  return response.data;
};

// Create a new group
export const createGroup = async (
  groupData: CreateGroupRequest
): Promise<Omit<Group, "members">> => {
  const response = await apiClient.post("/groups", groupData);
  return response.data;
};

// Get a specific group by ID
export const getGroupById = async (groupId: number): Promise<Group> => {
  const response = await apiClient.get(`/groups/${groupId}`);
  return response.data;
};

// Update a group
export const updateGroup = async (
  groupId: number,
  data: {
    name: string;
    description: string;
    password?: string;
    private?: boolean;
  }
): Promise<Omit<Group, "members">> => {
  const response = await apiClient.put(`/groups/${groupId}`, data);
  return response.data;
};

// Delete a group
export const deleteGroup = async (groupId: number): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}`);
};

// Join a group
export const joinGroup = async (
  groupId: number,
  password?: string
): Promise<Omit<Group, "members">> => {
  const queryParams = password ? `?password=${password}` : "";
  const response = await apiClient.post(
    `/groups/join-group/${groupId}${queryParams}`
  );
  return response.data;
};

// Leave a group
export const leaveGroup = async (groupId: number): Promise<void> => {
  await apiClient.post(`/groups/leave-group/${groupId}`);
};

// Get all members of a group
export const getGroupMembers = async (
  groupId: number
): Promise<GroupMember[]> => {
  const response = await apiClient.get(`/groups/${groupId}/members`);
  return response.data;
};

// Change a user's role in a group
export const changeUserRole = async (
  groupId: number,
  userId: string,
  role: "ADMIN" | "MEMBER"
): Promise<void> => {
  await apiClient.put(`/groups/${groupId}/members/${userId}/role`, { role });
};

// Remove a member from a group
export const removeMember = async (
  groupId: number,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
};

// Search for groups by name
export const searchGroups = async (query: string) => {
  const response = await apiClient.get(`/groups/search?query=${query}`);
  return response.data;
};
