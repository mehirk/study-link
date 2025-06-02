import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { Loader2, Edit, Trash2, Calendar, User, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@components/ui/use-toast";
import { updateDiscussion, deleteDiscussion } from "@lib/api/discussion";
import { UploadDropzone } from "@lib/uploadthing-client";
import { getInitials } from "@lib/utils";
import DeleteDiscussionModal from "./modals/delete-discussion-modal";
import useAuthStore from "@store/auth-store";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";
import { ScrollArea } from "@components/ui/scroll-area";
import { useDiscussionsQuery } from "@hooks/use-zero-queries";

const DiscussionInfoPanel = () => {
  const discussionId = useChatStore((state) => state.currentDiscussionId)!;
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );
  const groupId = useGroupStore((state) => state.currentGroupId)!;
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const user = useAuthStore((state) => state.user);
  const sessionToken = useAuthStore((state) => state.sessionToken);

  const { discussions } = useDiscussionsQuery(groupId);

  const discussion = discussions.find((d) => d.id === discussionId)!;

  const { toast } = useToast();

  const [editingInfo, setEditingInfo] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    title: "",
    content: "",
  });

  // Update editedInfo when discussion changes
  useEffect(() => {
    if (discussion) {
      setEditedInfo({
        title: discussion.title,
        content: discussion.content || "",
      });
    }
  }, [discussion]);

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

      setEditingInfo(false);
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

  const handleCancelEdit = () => {
    if (discussion) {
      setEditedInfo({
        title: discussion.title,
        content: discussion.content || "",
      });
    }
    setEditingInfo(false);
  };

  const handleDeleteDiscussion = async () => {
    try {
      setActionLoading(true);
      await deleteDiscussion(groupId, discussionId);
      setCurrentDiscussionId(null);
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-4 py-3 bg-accent">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Discussion Details</h2>
          {canEditDiscussion && !editingInfo && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingInfo(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Edit className="h-3 w-3 mr-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-14.5rem)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          {editingInfo ? (
            <div>
              <Input
                value={editedInfo.title}
                onChange={(e) =>
                  setEditedInfo({
                    ...editedInfo,
                    title: e.target.value,
                  })
                }
                className="font-semibold"
                placeholder="Discussion title..."
                autoFocus
              />
            </div>
          ) : (
            <h1 className="text-xl font-bold leading-tight break-words">
              {discussion.title}
            </h1>
          )}

          {/* Author Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={discussion.author?.image || ""}
                alt={discussion.author?.name || ""}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(discussion.author?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-sm truncate">
                  by {discussion.author?.name || ""}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(discussion.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            {editingInfo ? (
              <Textarea
                value={editedInfo.content}
                onChange={(e) =>
                  setEditedInfo({
                    ...editedInfo,
                    content: e.target.value,
                  })
                }
                placeholder="Add a description..."
                rows={4}
                className="resize-none text-sm"
              />
            ) : (
              <div className="min-h-[60px] p-3 bg-muted/30 rounded-md">
                {discussion.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {discussion.content}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-muted-foreground text-xs">
                      No description provided
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Actions */}
          {editingInfo && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={actionLoading}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateInfo}
                disabled={actionLoading || !editedInfo.title.trim()}
                className="h-7 px-2 text-xs"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Attachments */}
          <div>
            <h3 className="text-lg font-semibold my-2 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Attachments
            </h3>
            <UploadDropzone
              appearance={{
                container:
                  "border-2 border-dashed border-border rounded-md p-4 transition-colors hover:border-primary/50",
                button:
                  "ut-ready:bg-primary w-full p-2 ut-uploading:cursor-not-allowed rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm",
                label: "text-foreground text-sm",
                allowedContent: "text-muted-foreground text-xs",
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
              onUploadError={(error) => {
                toast({
                  variant: "destructive",
                  title: "Upload failed",
                  description: error.message || "Failed to upload files",
                });
              }}
            />
          </div>
        </div>

        <DeleteDiscussionModal
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirmDelete={handleDeleteDiscussion}
        />
      </ScrollArea>
    </div>
  );
};

export default DiscussionInfoPanel;
