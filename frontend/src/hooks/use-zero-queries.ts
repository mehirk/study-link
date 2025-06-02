import { useZero, useQuery as useZeroQuery } from "@rocicorp/zero/react";
import { Schema } from "../../../zero-syncer/generated/schema";

export const useMembershipQuery = (userId: string) => {
  const z = useZero<Schema>();

  const membershipQuery = z.query.group_member
    .where("userId", "=", userId)
    .related("group", (q) => q.where("deletedAt", "IS", null));

  const [memberships, membershipDetails] = useZeroQuery(membershipQuery, {
    ttl: "forever",
  });

  return { memberships, membershipDetails };
};

export const useDiscussionsQuery = (groupId: number) => {
  const z = useZero<Schema>();

  const discussionsQuery = z.query.discussion
    .where("groupId", "=", groupId)
    .where("deletedAt", "IS", null)
    .related("author");

  const [discussions, discussionsDetails] = useZeroQuery(discussionsQuery, {
    ttl: "forever",
  });

  return { discussions, discussionsDetails };
};

export const useChatQuery = (discussionId: number) => {
  const z = useZero<Schema>();

  const chatQuery = z.query.comment
    .where("discussionId", "=", discussionId)
    .where("deletedAt", "IS", null)
    .related("author");

  const [chat, chatDetails] = useZeroQuery(chatQuery, {
    ttl: "forever",
  });

  return { chat, chatDetails };
};

export const useFilesQuery = (groupId: number) => {
  const z = useZero<Schema>();

  const filesQuery = z.query.file
    .where("groupId", "=", groupId)
    .where("deletedAt", "IS", null)
    .related("uploadedBy")
    .related("discussion");

  const [files, filesDetails] = useZeroQuery(filesQuery, {
    ttl: "forever",
  });

  return { files, filesDetails };
};

export const useMembersQuery = (groupId: number) => {
  const z = useZero<Schema>();

  const membersQuery = z.query.group_member
    .where("groupId", "=", groupId)
    .related("user");

  const [members, membersDetails] = useZeroQuery(membersQuery, {
    ttl: "forever",
  });

  return { members, membersDetails };
};
