import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@components/ui/use-toast";
import {
  updateDiscussion,
  deleteDiscussion,
  fetchGroupDiscussions,
} from "@lib/api/discussion";
import { UploadDropzone } from "@lib/uploadthing-client";
import { getInitials } from "@lib/utils";
import DeleteDiscussionModal from "./modals/delete-discussion-modal";
import useAuthStore from "@store/auth-store";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const DiscussionInfoPanel = () => {
  const discussionId = useChatStore((state) => state.currentDiscussionId)!;
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );
  const groupId = useGroupStore((state) => state.currentGroup?.id)!;
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const user = useAuthStore((state) => state.user);
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const queryClient = useQueryClient();
  const { data: discussions } = useQuery({
    queryKey: ["discussions", groupId],
    queryFn: () => fetchGroupDiscussions(groupId),
  });

  const discussion = discussions?.find((d) => d.id === discussionId);

  const { toast } = useToast();

  const [editingInfo, setEditingInfo] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    title: discussion?.title ?? "",
    content: discussion?.content ?? "",
  });

  const handleUpdateInfo = async () => {
    if (!editedInfo.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Discussion title is required.",
      });
      return;
    }

    try {
      setActionLoading(true);
      await updateDiscussion(groupId, discussionId, {
        title: editedInfo.title,
        content: editedInfo.content || undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: ["discussions", groupId],
      });

      setEditingInfo(false);
      toast({
        title: "Success",
        description: "Discussion information updated successfully",
      });
    } catch (error) {
      console.error("Failed to update discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update discussion. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    try {
      setActionLoading(true);
      await deleteDiscussion(groupId, discussionId);

      await queryClient.invalidateQueries({
        queryKey: ["discussions", groupId],
      });
      setCurrentDiscussionId(null);

      toast({
        title: "Success",
        description: "Discussion deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete discussion. Please try again.",
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!discussion) {
    return null;
  }

  const canEditDiscussion = isAdmin || discussion.authorId === user?.id;

  return (
    <div className="h-full min-w-full p-3">
      <h2 className="text-2xl font-semibold mb-4">Discussion Info</h2>

      <Card className="shadow-none border-none">
        <CardHeader className="pb-2 space-y-4 relative">
          {canEditDiscussion && !editingInfo && (
            <div className="absolute top-4 right-4 flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingInfo(true)}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            {editingInfo ? (
              <Input
                value={editedInfo.title}
                onChange={(e) =>
                  setEditedInfo({
                    ...editedInfo,
                    title: e.target.value,
                  })
                }
                className="font-semibold text-xl"
                placeholder="Discussion title"
              />
            ) : (
              <CardTitle className="text-2xl leading-tight break-words pr-16">
                {discussion.title}
              </CardTitle>
            )}

            <div className="flex items-center space-x-3 border-l-4 pl-3 border-primary/30 py-1">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage
                  src={discussion.author.image || ""}
                  alt={discussion.author.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(discussion.author.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-base">
                  {discussion.author.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(discussion.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {editingInfo ? (
            <Textarea
              value={editedInfo.content}
              onChange={(e) =>
                setEditedInfo({
                  ...editedInfo,
                  content: e.target.value,
                })
              }
              placeholder="Add a description for your discussion..."
              rows={5}
              className="resize-none"
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              {discussion.content ? (
                <p className="leading-relaxed text-sm">{discussion.content}</p>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No description provided
                </p>
              )}
            </div>
          )}
        </CardContent>

        {editingInfo && (
          <div className="flex justify-end pb-4 pr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingInfo(false)}
              disabled={actionLoading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleUpdateInfo}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}

        <div className="px-6 pb-4 mt-2 border-t -mx-3 pt-4">
          <p className="text-sm font-medium mb-2">Attachments</p>
          <UploadDropzone
            appearance={{
              button:
                "ut-ready:bg-primary w-full p-2 ut-uploading:cursor-not-allowed rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 ease-in-out after:bg-primary/50",
            }}
            input={{
              discussionId: discussionId.toString(),
              token: sessionToken!,
              groupId: groupId.toString(),
            }}
            endpoint="discussionFiles"
            onClientUploadComplete={() => {
              toast({
                title: "Files uploaded",
                description: "Your files have been uploaded successfully",
              });
            }}
            className="border-dashed border-2 pt-2 pb-4"
          />
        </div>
      </Card>

      <DeleteDiscussionModal
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteDiscussion}
      />
    </div>
  );
};

export default DiscussionInfoPanel;
