import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { format } from "date-fns";
import { Comment } from "@lib/api/discussion";
import { getInitials } from "@lib/utils";
import useChatStore from "@store/chat-store";
import EditCommentForm from "@components/dashboard/chat/edit-comment-form";
import { useState } from "react";

interface CommentItemProps {
  comment: Comment;
  isCurrentUser: boolean;
  showAvatar: boolean;
  isFirstInGroup: boolean;
}

const CommentItem = ({
  comment,
  isCurrentUser,
  showAvatar,
  isFirstInGroup,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Render avatar or spacer
  const renderAvatarOrSpacer = (): React.ReactNode => {
    if (showAvatar) {
      return (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={comment.author?.image || ""}
            alt={comment.author?.name || ""}
          />
          <AvatarFallback>
            {getInitials(comment.author?.name || "")}
          </AvatarFallback>
        </Avatar>
      );
    }

    return <div className="w-8 sm:w-10 flex-shrink-0" />;
  };

  if (isEditing) {
    return (
      <div
        className={`flex ${
          isCurrentUser ? "justify-end" : "justify-start"
        } ${!isFirstInGroup ? "mt-0.5 sm:mt-1" : "mt-3 sm:mt-6"}`}
      >
        <div
          className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${
            isCurrentUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {renderAvatarOrSpacer()}
          <div>
            {!isCurrentUser && isFirstInGroup && (
              <div className="text-xs sm:text-sm font-medium mb-1">
                {comment.author?.name}
              </div>
            )}
            <div
              className={`rounded-lg p-2 sm:p-3 ${
                isCurrentUser
                  ? "bg-background border border-primary/30"
                  : "bg-background border border-muted/50"
              }`}
            >
              <EditCommentForm
                initialContent={comment.content}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${
        !isFirstInGroup ? "mt-1" : "mt-6"
      }`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {showAvatar ? (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={comment.author?.image || ""}
              alt={comment.author?.name || ""}
            />
            <AvatarFallback>
              {getInitials(comment.author?.name || "")}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 flex-shrink-0" /> // Empty spacer to maintain alignment
        )}

        <div>
          {!isCurrentUser && isFirstInGroup && (
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {comment.author?.name}
            </div>
          )}
          <div className="flex flex-col">
            <div
              className={`flex items-center gap-2 ${
                isCurrentUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`rounded-md max-w-64 px-4 py-2 ${
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {comment.content}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(comment.createdAt), "h:mm a")}
                </span>

                {isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 transition-opacity duration-200"
                      >
                        <MoreVertical className="h-3 w-3" />
                        <span className="sr-only">Message options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align={isCurrentUser ? "end" : "start"}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setIsEditing(true);
                          useChatStore.getState().setCommentToEdit(comment.id);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          useChatStore.getState().setCommentToDelete(comment.id)
                        }
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
