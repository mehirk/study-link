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
