import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from "../ui/card";
import { Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "../ui/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getDiscussionsByAuthor, AuthorDiscussions } from "../../lib/api/group";

interface AuthorDiscussionsProps {
  groupId: number;
  authorId: string;
  onBack: () => void;
  onSelectDiscussion: (discussionId: number) => void;
}

const AuthorDiscussionsView = ({
  groupId,
  authorId,
  onBack,
  onSelectDiscussion,
}: AuthorDiscussionsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authorData, setAuthorData] = useState<AuthorDiscussions | null>(null);

  const loadAuthorDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDiscussionsByAuthor(groupId, authorId);
      setAuthorData(data);
    } catch (error) {
      console.error("Failed to load author discussions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discussions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, authorId, toast]);

  useEffect(() => {
    loadAuthorDiscussions();
  }, [loadAuthorDiscussions]);

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

  if (!authorData) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Author not found</h3>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Button>
      </div>
    );
  }

  const { author, discussions } = authorData;

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Discussions
      </Button>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.image || ""} alt={author.name} />
          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{author.name}</h2>
          <p className="text-muted-foreground">
            {discussions.length} discussion{discussions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            This member hasn't created any discussions yet.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-4 pr-4">
            {discussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelectDiscussion(discussion.id)}
              >
                <CardHeader className="pb-2">
                  <h3 className="text-xl font-semibold">{discussion.title}</h3>
                  <CardDescription>
                    Posted {formatDistanceToNow(new Date(discussion.createdAt), {
                      addSuffix: true,
                    })}
                    {discussion.updatedAt !== discussion.createdAt && (
                      <span> · Edited</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm line-clamp-2">
                    {discussion.content || "No content provided."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {discussion._count?.comments || 0}{" "}
                      {discussion._count?.comments === 1 ? "comment" : "comments"}
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AuthorDiscussionsView; 