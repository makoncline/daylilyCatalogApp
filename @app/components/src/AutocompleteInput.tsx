import { Button, FormGroup } from "@app/design";
import { useCombobox, UseComboboxStateChange } from "downshift";
import React from "react";
import styled from "styled-components";

type Props<T> = {
  items: T[];
  onInputValueChange?: ({ inputValue }: UseComboboxStateChange<T>) => void;
  onSelectedItemChange: ({ selectedItem }: UseComboboxStateChange<T>) => void;
  itemToString: (item: T | null) => string;
  children: string;
};

const AutocompleteInput = <T extends unknown>({
  items,
  onInputValueChange,
  onSelectedItemChange,
  itemToString,
  children: child,
}: Props<T>) => {
  const {
    isOpen,
    getLabelProps,
    getInputProps,
    getToggleButtonProps,
    getMenuProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items,
    onInputValueChange: onInputValueChange || undefined,
    onSelectedItemChange,
    itemToString,
  });
  return (
    <Autocomplete>
      <label {...getLabelProps()}>{child}</label>
      <FormGroup {...getComboboxProps()} direction="row">
        <Input
          {...getInputProps()}
          id="registered-daylily-search"
          style={{ flexGrow: 1 }}
        />
        <Button
          type="button"
          {...getToggleButtonProps()}
          aria-label={"toggle menu"}
        >
          &#8595;
        </Button>
      </FormGroup>
      <Menu {...getMenuProps()}>
        {isOpen &&
          items.map((item, index) => (
            <Item
              style={{
                backgroundColor:
                  highlightedIndex === index ? "var(--surface-2)" : "",
              }}
              key={`${itemToString(item)}-${index}`}
              {...getItemProps({ item, index })}
            >
              {itemToString(item)}
            </Item>
          ))}
      </Menu>
    </Autocomplete>
  );
};

export { AutocompleteInput };

const Autocomplete = styled.div`
  position: relative;
`;
const Input = styled.input`
  flex-grow: 1;
`;
const Menu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 0;
  list-style: none;
  background-color: var(--surface-1);
  display: table;
  width: 100%;
`;
const Item = styled.li`
  display: table-row;
  border-bottom: 1px solid var(--surface-2);
`;
