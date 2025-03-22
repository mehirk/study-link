import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { Loader2, Edit, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@components/ui/use-toast";
import {
  getDiscussion,
  Discussion,
  updateDiscussion,
} from "@lib/api/discussion";

interface DiscussionInfoPanelProps {
  discussionId: number;
  groupId: number;
  isAdmin: boolean;
}

const DiscussionInfoPanel = ({
  discussionId,
  groupId,
  isAdmin,
}: DiscussionInfoPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    const loadDiscussion = async () => {
      if (!groupId || !discussionId) return;

      try {
        setLoading(true);
        const data = await getDiscussion(groupId, discussionId);
        setDiscussion(data);
        setEditedInfo({
          title: data.title,
          content: data.content || "",
        });
      } catch (error) {
        console.error("Failed to load discussion:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load discussion info. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDiscussion();
  }, [groupId, discussionId, toast]);

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
      setLoading(true);
      const updated = await updateDiscussion(groupId, discussionId, {
        title: editedInfo.title,
        content: editedInfo.content || undefined,
      });

      setDiscussion(updated);
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
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Discussion not found</h3>
      </div>
    );
  }

  const canEditDiscussion = isAdmin || discussion.authorId === user?.id;

  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-semibold mb-4">Discussion Info</h2>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage
                  src={discussion.author.image || ""}
                  alt={discussion.author.name}
                />
                <AvatarFallback>
                  {getInitials(discussion.author.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                {editingInfo ? (
                  <Input
                    value={editedInfo.title}
                    onChange={(e) =>
                      setEditedInfo({
                        ...editedInfo,
                        title: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                ) : (
                  <CardTitle>{discussion.title}</CardTitle>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  Started by {discussion.author.name} ·{" "}
                  {formatDistanceToNow(new Date(discussion.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>

            {canEditDiscussion && (
              <>
                {editingInfo ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingInfo(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={handleUpdateInfo}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingInfo(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        {!editingInfo ? (
          discussion.content && (
            <CardContent>
              <p className="text-sm">{discussion.content}</p>
            </CardContent>
          )
        ) : (
          <CardContent>
            <Textarea
              value={editedInfo.content}
              onChange={(e) =>
                setEditedInfo({
                  ...editedInfo,
                  content: e.target.value,
                })
              }
              placeholder="Discussion description"
              rows={3}
            />
          </CardContent>
        )}
      </Card>

      {/* Additional info can be added here */}
      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-medium">Participants:</span>{" "}
          {discussion._count?.comments || 0} people have commented
        </div>
      </div>
    </div>
  );
};

export default DiscussionInfoPanel;
