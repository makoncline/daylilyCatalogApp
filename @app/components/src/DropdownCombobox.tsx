import { AhsDatum } from "@app/graphql";
import { useCombobox } from "downshift";
import React, { useState } from "react";

function DropdownCombobox({
  items,
}: {
  items: Pick<AhsDatum, "id" | "ahsId" | "name" | "image">[];
}) {
  const [inputItems, setInputItems] = useState(items);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items.filter(
          (item) =>
            inputValue &&
            item.name?.toLowerCase().startsWith(inputValue.toLowerCase())
        )
      );
    },
    itemToString: (item) => (item?.name ? item.name : ""),
  });
  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <div {...getComboboxProps()}>
        <input {...getInputProps()} />
        <button
          type="button"
          {...getToggleButtonProps()}
          aria-label="toggle menu"
        >
          &#8595;
        </button>
      </div>
      <ul {...getMenuProps()}>
        {isOpen &&
          inputItems.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: "#bde4ff" } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.name}
            </li>
          ))}
      </ul>
    </div>
  );
}

export { DropdownCombobox };
