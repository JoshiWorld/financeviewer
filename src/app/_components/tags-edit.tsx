"use client";

import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EditTag } from "@/components/edit-tag";
import { Button } from "@/components/ui/button";
import { CreateTag } from "@/components/create-tag";

export function EditTags() {
  const { toast } = useToast();

  const [isEditDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const { data: tags, isLoading, isError, error } = api.user.getTags.useQuery();

  const queryClient = useQueryClient();

  const handleEdit = (tagId: string) => {
    setSelectedTagId(tagId);
    setCreateDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    queryClient.invalidateQueries([
      "user.getTags"
    ]);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    queryClient.invalidateQueries([
      "user.getTags",
    ]);
  };

  if (isLoading) {
    return <p>Loading..</p>;
  }

  if (isError) {
    toast({
      variant: "destructive",
      title: "Ups! Da ist wohl etwas schiefgelaufen.",
      description: "Die Anfrage konnte nicht bearbeitet werden",
      action: <ToastAction altText="Try again">Erneut versuchen</ToastAction>,
    });
    console.log(error);
  }

  return (
    <div>
      {tags && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bezeichnung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id} onClick={() => handleEdit(tag.id)}>
                <TableCell className="font-medium">{tag.title}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedTagId && !isCreateDialogOpen && (
        <EditTag
          tagId={selectedTagId}
          isOpen={isEditDialogOpen}
          onClose={handleEditClose}
        />
      )}

      <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
        Tag hinzufügen
      </Button>

      {!isEditDialogOpen && (
        <CreateTag isOpen={isCreateDialogOpen} onClose={handleCreateClose} />
      )}
    </div>
  );
}
