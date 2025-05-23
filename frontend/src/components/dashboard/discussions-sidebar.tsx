import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageCircle, Plus } from "lucide-react";
import { createDiscussion, Discussion } from "@lib/api/discussion";
import useChatStore from "@store/chat-store";
import CreateDiscussionModal from "./modals/create-discussion-modal";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@components/ui/use-toast";
import useGroupStore from "@store/group-store";

interface DiscussionsSidebarProps {
  loading: boolean;
  discussions: Discussion[];
}
const DiscussionsSidebar = ({
  loading,
  discussions,
}: DiscussionsSidebarProps) => {
  const { toast } = useToast();
  const groupId = useGroupStore((state) => state.currentGroup?.id)!;
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const createDiscussionMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createDiscussion(groupId, {
        title,
        content,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discussions", groupId] });
      setCurrentDiscussionId(data.id);
      setCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create discussion. Please try again.",
      });
    },
  });

  const handleCreateDiscussion = async (title: string, content: string) => {
    createDiscussionMutation.mutate({ title, content });
  };

  const currentDiscussionId = useChatStore(
    (state) => state.currentDiscussionId
  );
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );

  return (
    <div className="min-w-72 w-72 border-r h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">My Discussions</h3>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Discussions list */}
      <ScrollArea className="flex-1 p-1">
        {loading ? (
          <div className="text-center p-4 flex justify-center items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : discussions.length > 0 ? (
          discussions.map((discussion) => (
            <button
              key={discussion.id}
              className={cn(
                "w-full px-3 py-2 mb-2 text-left rounded-md transition-colors flex flex-col",
                "hover:bg-accent hover:text-accent-foreground",
                currentDiscussionId === discussion.id &&
                  "bg-accent text-accent-foreground"
              )}
              onClick={() => setCurrentDiscussionId(discussion.id)}
            >
              <span className="font-medium truncate">{discussion.title}</span>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className="truncate">by {discussion.author.name}</span>
                <span className="mx-1">·</span>
                <span>
                  {formatDistanceToNow(new Date(discussion.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center text-xs mt-1">
                <MessageCircle className="h-3 w-3 mr-1" />
                <span>{discussion._count?.comments || 0}</span>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No discussions yet. Create a new discussion to get started.
          </div>
        )}
      </ScrollArea>

      <CreateDiscussionModal
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateDiscussion={handleCreateDiscussion}
      />
    </div>
  );
};

export default DiscussionsSidebar;
