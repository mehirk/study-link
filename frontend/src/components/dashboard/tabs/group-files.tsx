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
import { useMutation } from "@tanstack/react-query";
import { getInitials } from "@lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { File as FileType, formatFileSize, deleteFile } from "@lib/api/files";
import useAuthStore from "@store/auth-store";
import useGroupStore from "@store/group-store";
import { formatDistanceToNow } from "date-fns";
import { useFilesQuery } from "@hooks/use-zero-queries";

const GroupFiles = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const groupId = useGroupStore((state) => state.currentGroupId)!;

  const { files, filesDetails } = useFilesQuery(groupId);

  const loading = filesDetails.type === "unknown";

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => deleteFile(fileId),
    onSuccess: () => {
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

  const handleFileDelete = async (fileId: number) => {
    await deleteFile(fileId);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center pt-8 p-4 text-muted-foreground">
        No files have been uploaded to this group yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card Layout */}
      <div className="p-4 border-b bg-muted flex justify-between items-center">
        <h3 className="font-semibold">
          Group Files from all Discussions - {files.length}
        </h3>
      </div>
      <div className="block md:hidden space-y-2">
        {files.map((file) => (
          <div key={file.id} className="border-b p-3 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">
                  {file.fileName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)} •{" "}
                  {formatDistanceToNow(new Date(file.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileDownload(file)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {(isAdmin ||
                  String(file.uploadedBy?.id) === String(user?.id)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8 w-8 p-0"
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
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    className="object-cover"
                    src={file.uploadedBy?.image || ""}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(file.uploadedBy?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {file.uploadedBy?.name}
                </span>
              </div>
              {file.discussion && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {file.discussion.title}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="text-center pt-8 p-4 text-muted-foreground">
              Files uploaded to this group
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-muted">
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
                          src={file.uploadedBy?.image || ""}
                        />
                        <AvatarFallback>
                          {getInitials(file.uploadedBy?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{file.uploadedBy?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(file.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFileDownload(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {(isAdmin ||
                      String(file.uploadedBy?.id) === String(user?.id)) && (
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
        </div>
      </div>
    </div>
  );
};

export default GroupFiles;
