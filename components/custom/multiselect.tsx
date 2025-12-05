"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";

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
        <Button
          variant="outline"
          className="w-full justify-between px-3 py-2 h-10 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2 truncate">
            {span && <span className="font-medium">{span}</span>}
            {selectedCount > 0 ? (
              <Badge>
                {selectedCount}
              </Badge>
            ) : (
              <Badge variant={"outline"} className="text-sm text-muted-foreground">Select items</Badge>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="mb-0">{label}</DropdownMenuLabel>
          {selectedCount > 0 && (
            <Button
              onClick={() => {
                setCheckedState({});
                if (onChange) onChange([]);
              }}
              size={"sm"}
              variant={"link"}
            >
              Clear all
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8"
        />
        <div className="max-h-64 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <DropdownMenuCheckboxItem
                key={item.id}
                checked={checkedState[item.id]}
                onCheckedChange={(value) => handleChange(item.id, value)}
                disabled={item.disabled}
                className="cursor-pointer"
              >
                {item.name}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items found
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
