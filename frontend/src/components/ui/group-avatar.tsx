import { cn, getInitials } from "@lib/utils";

interface GroupAvatarProps {
  name: string;
  className?: string;
}

const GroupAvatar = ({ name, className }: GroupAvatarProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium",
        "w-8 h-8 text-sm",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export default GroupAvatar;
