"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface DynamicDropdownProps {
  label?: string;
  items: { id: string; name: string; disabled?: boolean }[];
  selected?: string[]; // pre-selected item ids
  onChange?: (checkedItems: string[]) => void;
  span?: string;
}

export function DropdownCheckboxes({
  label = "Options",
  items,
  selected = [],
  onChange,
  span = "",
}: DynamicDropdownProps) {
  const [checkedState, setCheckedState] = React.useState<Record<string, Checked>>({});
  const [search, setSearch] = React.useState("");

  // Initialize or update state whenever items or selected changes
  React.useEffect(() => {
    const state: Record<string, Checked> = {};
    items.forEach((item) => {
      state[item.id] = selected.includes(item.id);
    });
    setCheckedState(state);
  }, [items, selected]);

  const handleChange = (id: string, value: Checked) => {
    const updated = { ...checkedState, [id]: value };
    setCheckedState(updated);
    if (onChange) {
      const checkedItems = Object.keys(updated).filter((key) => updated[key]);
      onChange(checkedItems);
    }
  };

  const selectedCount = Object.values(checkedState).filter(Boolean).length;

  // Filter items by search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {span} {selectedCount > 0 ? `(${selectedCount}) selected` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-2">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Search Input */}
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        {filteredItems.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={checkedState[item.id]}
            onCheckedChange={(value) => handleChange(item.id, value)}
            disabled={item.disabled}
          >
            {item.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
