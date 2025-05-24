import { Loader2, Download, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Button } from "@components/ui/button";
import { toast } from "@components/ui/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getInitials } from "@lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import {
  getGroupFiles,
  File as FileType,
  formatFileSize,
  deleteFile,
} from "@lib/api/files";
import useAuthStore from "@store/auth-store";
import useGroupStore from "@store/group-store";

const GroupFiles = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const groupId = useGroupStore((state) => state.currentGroup?.id)!;
  const queryClient = useQueryClient();

  // Fetch files
  const { data: files = [] } = useQuery({
    queryKey: ["group-files", groupId],
    queryFn: () => getGroupFiles(groupId),
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => deleteFile(fileId),
    onSuccess: (_, fileId) => {
      queryClient.setQueryData(
        ["groupFiles", groupId],
        (oldData: FileType[] | undefined) =>
          oldData ? oldData.filter((file) => file.id !== fileId) : []
      );
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileDownload = (file: FileType) => {
    window.open(file.url, "_blank");
  };

  const handleFileDelete = (fileId: number) => {
    deleteFileMutation.mutate(fileId);
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          No files have been uploaded to this group yet.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Files uploaded to this group</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Filename</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Discussion</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Uploaded On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium">{file.fileName}</TableCell>
            <TableCell>{formatFileSize(file.size)}</TableCell>
            <TableCell>
              {file.discussion ? file.discussion.title : "—"}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    className="object-cover"
                    src={file.uploadedBy.image || ""}
                  />
                  <AvatarFallback>
                    {getInitials(file.uploadedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{file.uploadedBy.name}</span>
              </div>
            </TableCell>
            <TableCell>
              {new Date(file.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFileDownload(file)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {(isAdmin || String(file.uploadedBy.id) === String(user?.id)) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleFileDelete(file.id)}
                  disabled={deleteFileMutation.isPending}
                >
                  {deleteFileMutation.isPending &&
                  deleteFileMutation.variables === file.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GroupFiles;
