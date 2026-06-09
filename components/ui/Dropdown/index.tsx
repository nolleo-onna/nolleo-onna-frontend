"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  placeholder?: string;
}

export default function Dropdown({
  options,
  placeholder = "선택",
}: DropdownProps) {
  const [selected, setSelected] = useState<Option | null>(null);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative inline-block">
        <ListboxButton className="flex items-center gap-1 text-sm font-medium text-gray-700 outline-none focus:outline-none">
          <span>{selected?.label ?? placeholder}</span>
          <ChevronDownIcon className="size-3.5" />
        </ListboxButton>

        <ListboxOptions
          anchor="bottom end"
          className="mt-1 w-28 overflow-hidden rounded-xl bg-white shadow-lg outline-none focus:outline-none"
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option}
              className="cursor-pointer px-3 py-2 text-sm text-gray-700 data-[focus]:bg-gray-50 not-last:border-b not-last:border-gray-100"
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
