import { Button } from "@components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Comment } from "@lib/api/discussion";
import { getInitials } from "./utils";

interface CommentItemProps {
  comment: Comment;
  isCurrentUser: boolean;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  showAvatar: boolean;
  isFirstInGroup: boolean;
}

const CommentItem = ({
  comment,
  isCurrentUser,
  onEdit,
  onDelete,
  showAvatar,
  isFirstInGroup,
}: CommentItemProps) => (
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
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage
            src={comment.author.image || ""}
            alt={comment.author.name}
          />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-9 flex-shrink-0" /> // Empty spacer to maintain alignment
      )}

      <div>
        {!isCurrentUser && isFirstInGroup && (
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {comment.author.name}
          </div>
        )}
        <div className="flex flex-col">
          <div
            className={`flex items-center gap-2 ${
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`rounded-3xl max-w-64 p-2.5 ${
                isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(comment.createdAt), "h:mm a")}
            </span>
          </div>

          {isCurrentUser && (
            <div className="flex justify-end gap-1 mt-1 px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(comment)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default CommentItem;
