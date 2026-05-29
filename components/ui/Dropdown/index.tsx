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
    <Listbox
      value={selected}
      onChange={setSelected}
    >
      <div className="relative inline-block">
        <ListboxButton
          className="
            flex items-center gap-2
            text-xl font-medium text-black

            outline-none
            focus:outline-none
          "
        >
          <span>
            {selected?.label ?? placeholder}
          </span>

          <ChevronDownIcon className="size-4" />
        </ListboxButton>

        <ListboxOptions
          anchor="bottom start"
          className="
            mt-2
            w-36
            overflow-hidden
            rounded-2xl

            bg-white
            shadow-lg

            outline-none
            focus:outline-none
          "
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option}
              className="
                cursor-pointer
                px-4
                py-3
                text-lg
                text-black

                data-[focus]:bg-gray-50

                not-last:border-b
                not-last:border-gray-100
              "
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}