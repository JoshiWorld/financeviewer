"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tag = {
  id: string;
  title: string;
};

type TagSelectorProps = {
  tags: Tag[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
};

export function TagSelector({
  tags,
  selectedTag,
  setSelectedTag,
}: TagSelectorProps) {
  const [tagInputVisible, setTagInputVisible] = useState<boolean>(
    tags.length === 0,
  );
  const [newTag, setNewTag] = useState<string>("");

  const handleTagChange = (value: string) => {
    if (value === "new") {
      setTagInputVisible(true);
      setSelectedTag(null);
    } else {
      setSelectedTag(value);
      setTagInputVisible(false);
    }
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="tag" className="text-right">
        Tag
      </Label>
      <div className="col-span-3">
        {tagInputVisible ? (
          <Input
            id="tag"
            type="text"
            onChange={(event) => setNewTag(event.target.value)}
            value={newTag}
            placeholder="Neuen Tag erstellen..."
            onBlur={() => setSelectedTag(newTag)}
          />
        ) : (
          // @ts-expect-error || @ts-ignore
          <Select value={selectedTag} onValueChange={handleTagChange}>
            <SelectTrigger id="tag">
              <SelectValue placeholder="Tag auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.title}>
                    {tag.title}
                  </SelectItem>
                ))}
                <SelectItem value="new">Neuen Tag erstellen...</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
