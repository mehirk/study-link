import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@components/ui/button";
import { PlusIcon, Loader2, MessageCircle, Trash2, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  fetchGroupDiscussions,
  createDiscussion,
  deleteDiscussion,
  updateDiscussion,
  Discussion,
} from "@lib/api/discussion";
import { Separator } from "@components/ui/separator";
import { ScrollArea } from "@components/ui/scroll-area";

interface GroupDiscussionsProps {
  groupId: number;
  isAdmin: boolean;
  onSelectDiscussion?: (discussionId: number) => void;
  onViewAuthorDiscussions?: (authorId: string) => void;
  refreshTrigger?: number;
}

const GroupDiscussions = ({
  groupId,
  isAdmin,
  onSelectDiscussion,
  onViewAuthorDiscussions,
  refreshTrigger = 0,
}: GroupDiscussionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<Discussion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [discussionToEdit, setDiscussionToEdit] = useState<Discussion | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discussionToDelete, setDiscussionToDelete] = useState<number | null>(
    null
  );

  const loadDiscussions = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const data = await fetchGroupDiscussions(groupId);
      setDiscussions(data);
    } catch (error) {
      console.error("Failed to load discussions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discussions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  // Load discussions when component mounts, groupId changes, or refreshTrigger changes
  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions, refreshTrigger]);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDiscussion.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a title for your discussion.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const createdDiscussion = await createDiscussion(groupId, {
        title: newDiscussion.title,
        content: newDiscussion.content || undefined,
      });

      setDiscussions([createdDiscussion, ...discussions]);
      setCreateDialogOpen(false);
      setNewDiscussion({ title: "", content: "" });

      toast({
        title: "Success",
        description: "Discussion created successfully.",
      });
    } catch (error) {
      console.error("Failed to create discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create discussion. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (discussionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiscussionToDelete(discussionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDiscussion = async () => {
    if (discussionToDelete === null) return;

    try {
      await deleteDiscussion(groupId, discussionToDelete);
      setDiscussions(discussions.filter((d) => d.id !== discussionToDelete));
      toast({
        title: "Success",
        description: "Discussion deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete discussion. Please try again.",
      });
    } finally {
      setDiscussionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditDiscussion = (discussion: Discussion) => {
    setDiscussionToEdit(discussion);
    setEditFormData({
      title: discussion.title,
      content: discussion.content || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discussionToEdit) return;

    if (!editFormData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a title for your discussion.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedDiscussion = await updateDiscussion(
        groupId,
        discussionToEdit.id,
        {
          title: editFormData.title,
          content: editFormData.content || undefined,
        }
      );

      // Update the discussion in the list
      setDiscussions(
        discussions.map((d) =>
          d.id === updatedDiscussion.id ? updatedDiscussion : d
        )
      );

      setIsEditModalOpen(false);
      setDiscussionToEdit(null);

      toast({
        title: "Success",
        description: "Discussion updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update discussion. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a handler for viewing author discussions
  const handleViewAuthorDiscussions = (
    authorId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (onViewAuthorDiscussions) {
      onViewAuthorDiscussions(authorId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discussions</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateDiscussion}>
              <DialogHeader>
                <DialogTitle>Create a new discussion</DialogTitle>
                <DialogDescription>
                  Start a new topic for your group to discuss.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter discussion title"
                    value={newDiscussion.title}
                    onChange={(e) =>
                      setNewDiscussion({
                        ...newDiscussion,
                        title: e.target.value,
                      })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="content" className="text-right">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Enter discussion content"
                    value={newDiscussion.content}
                    onChange={(e) =>
                      setNewDiscussion({
                        ...newDiscussion,
                        content: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Discussion
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {discussions.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-lg font-medium">No discussions yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to start a discussion in this group.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4 pr-4">
            {discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-bold text-left"
                        onClick={() => {
                          if (onSelectDiscussion) {
                            onSelectDiscussion(discussion.id);
                          } else {
                            setSelectedDiscussion(discussion);
                          }
                        }}
                      >
                        {discussion.title}
                      </Button>
                    </CardTitle>
                    <div className="flex gap-1">
                      {(isAdmin || discussion.authorId === user?.id) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDiscussion(discussion);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => openDeleteDialog(discussion.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Posted by{" "}
                    {onViewAuthorDiscussions ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-muted-foreground"
                        onClick={(e) =>
                          handleViewAuthorDiscussions(discussion.author.id, e)
                        }
                      >
                        {discussion.author.name}
                      </Button>
                    ) : (
                      <span>{discussion.author.name}</span>
                    )}{" "}
                    ·{" "}
                    {formatDistanceToNow(new Date(discussion.createdAt), {
                      addSuffix: true,
                    })}
                    {discussion.updatedAt !== discussion.createdAt && (
                      <span> · Edited</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-sm">
                    {discussion.content || "No content provided."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      if (onSelectDiscussion) {
                        onSelectDiscussion(discussion.id);
                      } else {
                        setSelectedDiscussion(discussion);
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {discussion._count?.comments || 0}{" "}
                      {discussion._count?.comments === 1
                        ? "comment"
                        : "comments"}
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {!onSelectDiscussion && selectedDiscussion && (
        <Dialog
          open={!!selectedDiscussion}
          onOpenChange={(open) => !open && setSelectedDiscussion(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedDiscussion.title}</DialogTitle>
              <DialogDescription>
                Posted by {selectedDiscussion.author.name} ·{" "}
                {formatDistanceToNow(new Date(selectedDiscussion.createdAt), {
                  addSuffix: true,
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="whitespace-pre-wrap">
                {selectedDiscussion.content || "No content provided."}
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  // Here you would redirect to a full discussion view page
                  window.location.href = `/dashboard/groups/${groupId}/discussions/${selectedDiscussion.id}`;
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                View Full Discussion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Discussion Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateDiscussion}>
            <DialogHeader>
              <DialogTitle>Edit Discussion</DialogTitle>
              <DialogDescription>
                Update your discussion details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  placeholder="Enter discussion title"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="edit-content"
                  placeholder="Enter discussion content"
                  value={editFormData.content}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      content: e.target.value,
                    })
                  }
                  className="col-span-3"
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Discussion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Discussion Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discussion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discussion? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDiscussion}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDiscussions;
