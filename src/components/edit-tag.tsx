"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type EditTagProps = {
  tagId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function EditTag({ tagId, isOpen, onClose }: EditTagProps) {
  const { toast } = useToast();
  const {
    data: tag,
    isLoading,
    isError,
    error,
  } = api.user.getTag.useQuery({ id: tagId });

  const editTag = api.user.updateTag.useMutation({
    onSuccess: () => {
      onClose();
      toast({
        description: "Der Eintrag wurde erfolgreich bearbeitet",
      });
    },
  });
  const deleteTag = api.user.deleteTag.useMutation({
    onSuccess: () => {
      onClose();
      toast({
        variant: "destructive",
        description: "Der Eintrag wurde erfolgreich gelöscht",
      });
    },
  });

  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Ups! Da ist wohl etwas schiefgelaufen.",
        description: "Die Anfrage konnte nicht bearbeitet werden",
        action: <ToastAction altText="Try again">Erneut versuchen</ToastAction>,
      });
      console.log(error);
    }

    if (tag) {
      setTitle(tag.title);
    }
  }, [isError, toast, error, tag]);

  if (isLoading) {
    return <p>Loading..</p>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tag Bearbeiten</DialogTitle>
          <DialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Bearbeite die
            Details des Tags.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          tag && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titel
                </Label>
                <Input
                  id="title"
                  type="text"
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                  className="col-span-3"
                />
              </div>
            </div>
          )
        )}
        <DialogFooter className="flex justify-between">
          <Button
            type="submit"
            variant="destructive"
            disabled={deleteTag.isPending}
            onClick={() =>
              deleteTag.mutate({
                id: tagId,
              })
            }
          >
            {deleteTag.isPending ? "Wird gelöscht.." : "Löschen"}
          </Button>
          <Button
            type="submit"
            disabled={editTag.isPending}
            onClick={() =>
              editTag.mutate({
                id: tagId,
                title,
              })
            }
          >
            {editTag.isPending ? "Wird gespeichert.." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
