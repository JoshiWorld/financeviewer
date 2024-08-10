"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";

type CreateTagProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateTag({ isOpen, onClose }: CreateTagProps) {
  const { toast } = useToast();
  const createTag = api.user.createTag.useMutation({
    onSuccess: () => {
      setTitle("");
      onClose();
      toast({
        description: "Der Eintrag wurde erstellt.",
      });
    },
  });

  const [title, setTitle] = useState<string>("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tag hinzufügen</DialogTitle>
          <DialogDescription>
            Hier kannst du einen neuen Tag hinzufügen
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button
            type="submit"
            disabled={createTag.isPending}
            onClick={() =>
              createTag.mutate({
                title,
              })
            }
          >
            {createTag.isPending ? "Wird hinzugefügt.." : "Hinzufügen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
