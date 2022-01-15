import { ListDataFragment, useListsQuery } from "@app/graphql";
import { UseComboboxStateChange } from "downshift";
import React from "react";

import { AutocompleteInput } from "./AutocompleteInput";

type ListInputProps = {
  onSelectedItemChange: ({
    selectedItem,
  }: UseComboboxStateChange<ListDataFragment>) => void;
};

export const ListInput = ({ onSelectedItemChange }: ListInputProps) => {
  const { data } = useListsQuery();
  const lists = data?.currentUser?.lists.nodes;

  return (
    <AutocompleteInput<ListDataFragment>
      items={lists || []}
      itemToString={(item) => item?.name ?? ""}
      onSelectedItemChange={onSelectedItemChange}
    >
      List
    </AutocompleteInput>
  );
};
