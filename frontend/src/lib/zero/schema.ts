import {
  table,
  string,
  //   boolean,
  number,
  //   enumeration,
  //   relationships,
  createSchema,
  type Row,
} from "@rocicorp/zero";

// Define enums

// export enum Role {
//   ADMIN = "ADMIN",
//   MEMBER = "MEMBER",
// }

// Define tables

// export const userTable = table("user")
//   .columns({
//     id: string(),
//     email: string(),
//     createdAt: number(),
//     updatedAt: number(),
//     name: string(),
//     emailVerified: boolean(),
//     image: string().optional(),
//   })
//   .primaryKey("id");

// export const groupTable = table("group")
//   .columns({
//     id: number(),
//     name: string(),
//     description: string().optional(),
//     private: boolean(),
//     password: string().optional(),
//     createdAt: number(),
//     updatedAt: number(),
//     deletedAt: number().optional(),
//   })
//   .primaryKey("id");

// export const groupMemberTable = table("group_member")
//   .columns({
//     id: number(),
//     userId: string(),
//     groupId: number(),
//     role: enumeration<Role>(),
//     joinedAt: number(),
//   })
//   .primaryKey("id");

// export const discussionTable = table("discussion")
//   .columns({
//     id: number(),
//     title: string(),
//     content: string().optional(),
//     groupId: number(),
//     authorId: string(),
//     createdAt: number(),
//     updatedAt: number(),
//     deletedAt: number().optional(),
//   })
//   .primaryKey("id");

export const commentTable = table("comment")
  .columns({
    id: number(),
    content: string(),
    discussionId: number(),
    authorId: string(),
    createdAt: number(),
    updatedAt: number(),
    deletedAt: number().optional(),
  })
  .primaryKey("id");

// export const fileTable = table("file")
//   .columns({
//     id: number(),
//     fileName: string(),
//     url: string(),
//     groupId: number(),
//     discussionId: number(),
//     size: number(),
//     uploadedById: string(),
//     createdAt: number(),
//     deletedAt: number().optional(),
//   })
//   .primaryKey("id");

// export const sessionTable = table("session")
//   .columns({
//     id: string(),
//     expiresAt: number(),
//     token: string(),
//     createdAt: number(),
//     updatedAt: number(),
//     ipAddress: string().optional(),
//     userAgent: string().optional(),
//     userId: string(),
//   })
//   .primaryKey("id");

// export const accountTable = table("account")
//   .columns({
//     id: string(),
//     accountId: string(),
//     providerId: string(),
//     userId: string(),
//     accessToken: string().optional(),
//     refreshToken: string().optional(),
//     idToken: string().optional(),
//     accessTokenExpiresAt: number().optional(),
//     refreshTokenExpiresAt: number().optional(),
//     scope: string().optional(),
//     password: string().optional(),
//     createdAt: number(),
//     updatedAt: number(),
//   })
//   .primaryKey("id");

// export const verificationTable = table("verification")
//   .columns({
//     id: string(),
//     identifier: string(),
//     value: string(),
//     expiresAt: number(),
//     createdAt: number().optional(),
//     updatedAt: number().optional(),
//   })
//   .primaryKey("id");

// Define relationships

// export const userTableRelationships = relationships(userTable, ({ many }) => ({
//   sessions: many({
//     sourceField: ["id"],
//     destField: ["userId"],
//     destSchema: sessionTable,
//   }),
//   accounts: many({
//     sourceField: ["id"],
//     destField: ["userId"],
//     destSchema: accountTable,
//   }),
//   groups: many({
//     sourceField: ["id"],
//     destField: ["userId"],
//     destSchema: groupMemberTable,
//   }),
//   discussions: many({
//     sourceField: ["id"],
//     destField: ["authorId"],
//     destSchema: discussionTable,
//   }),
//   comments: many({
//     sourceField: ["id"],
//     destField: ["authorId"],
//     destSchema: commentTable,
//   }),
//   files: many({
//     sourceField: ["id"],
//     destField: ["uploadedById"],
//     destSchema: fileTable,
//   }),
// }));

// export const groupTableRelationships = relationships(
//   groupTable,
//   ({ many }) => ({
//     members: many({
//       sourceField: ["id"],
//       destField: ["groupId"],
//       destSchema: groupMemberTable,
//     }),
//     discussions: many({
//       sourceField: ["id"],
//       destField: ["groupId"],
//       destSchema: discussionTable,
//     }),
//     files: many({
//       sourceField: ["id"],
//       destField: ["groupId"],
//       destSchema: fileTable,
//     }),
//   })
// );

// export const groupMemberTableRelationships = relationships(
//   groupMemberTable,
//   ({ one }) => ({
//     user: one({
//       sourceField: ["userId"],
//       destField: ["id"],
//       destSchema: userTable,
//     }),
//     group: one({
//       sourceField: ["groupId"],
//       destField: ["id"],
//       destSchema: groupTable,
//     }),
//   })
// );

// export const discussionTableRelationships = relationships(
//   discussionTable,
//   ({ many }) => ({
//     // group: one({
//     //   sourceField: ["groupId"],
//     //   destField: ["id"],
//     //   destSchema: groupTable,
//     // }),
// author: one({
//   sourceField: ["authorId"],
//   destField: ["id"],
//   destSchema: userTable,
// }),
// comments: many({
//   sourceField: ["id"],
//   destField: ["discussionId"],
//   destSchema: commentTable,
// }),
// files: many({
//   sourceField: ["id"],
//   destField: ["discussionId"],
//   destSchema: fileTable,
// }),
// })
// );

// export const commentTableRelationships = relationships(
//   commentTable,
//   ({ one }) => ({
//     discussion: one({
//       sourceField: ["discussionId"],
//       destField: ["id"],
//       destSchema: discussionTable,
//     }),
//     author: one({
//       sourceField: ["authorId"],
//       destField: ["id"],
//       destSchema: userTable,
//     }),
//   })
// );

// export const fileTableRelationships = relationships(fileTable, ({ one }) => ({
//   group: one({
//     sourceField: ["groupId"],
//     destField: ["id"],
//     destSchema: groupTable,
//   }),
//   discussion: one({
//     sourceField: ["discussionId"],
//     destField: ["id"],
//     destSchema: discussionTable,
//   }),
//   uploadedBy: one({
//     sourceField: ["uploadedById"],
//     destField: ["id"],
//     destSchema: userTable,
//   }),
// }));

// export const sessionTableRelationships = relationships(
//   sessionTable,
//   ({ one }) => ({
//     user: one({
//       sourceField: ["userId"],
//       destField: ["id"],
//       destSchema: userTable,
//     }),
//   })
// );

// export const accountTableRelationships = relationships(
//   accountTable,
//   ({ one }) => ({
//     user: one({
//       sourceField: ["userId"],
//       destField: ["id"],
//       destSchema: userTable,
//     }),
//   })
// );

// Define schema

export const schema = createSchema({
  tables: [
    // userTable,
    // groupTable,
    // groupMemberTable,
    // discussionTable,
    commentTable,
    // fileTable,
    // sessionTable,
    // accountTable,
    // verificationTable,
  ],
  relationships: [
    // userTableRelationships,
    // groupTableRelationships,
    // groupMemberTableRelationships,
    // discussionTableRelationships,
    // commentTableRelationships,
    //  fileTableRelationships,
    // sessionTableRelationships,
    // accountTableRelationships,
  ],
});

// Define types
export type Schema = typeof schema;
// export type User = Row<typeof schema.tables.user>;
// export type Group = Row<typeof schema.tables.group>;
// export type GroupMember = Row<typeof schema.tables.group_member>;
// export type Discussion = Row<typeof schema.tables.discussion>;
export type Comment = Row<typeof schema.tables.comment>;
// export type File = Row<typeof schema.tables.file>;
// export type Session = Row<typeof schema.tables.session>;
// export type Account = Row<typeof schema.tables.account>;
// export type Verification = Row<typeof schema.tables.verification>;
