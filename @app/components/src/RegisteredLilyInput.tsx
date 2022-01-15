import {
  AhsSearchDataFragment,
  useSearchAhsLiliesLazyQuery,
} from "@app/graphql";
import { UseComboboxStateChange } from "downshift";
import React from "react";

import { AutocompleteInput } from "./AutocompleteInput";

type RegisteredLilyInputProps = {
  onSelectedItemChange: ({
    selectedItem,
  }: UseComboboxStateChange<AhsSearchDataFragment>) => void;
};

export const RegisteredLilyInput = ({
  onSelectedItemChange,
}: RegisteredLilyInputProps) => {
  const [searchAhsLilies, { data: searchData }] = useSearchAhsLiliesLazyQuery();

  React.useEffect(() => {
    searchAhsLilies({
      variables: {
        search: "a",
      },
    });
  }, [searchAhsLilies]);

  const searchResults = searchData?.searchAhsLilies?.nodes ?? [];

  const handleInputValueChange = ({
    inputValue,
  }: UseComboboxStateChange<AhsSearchDataFragment>) => {
    searchAhsLilies({
      variables: {
        search: inputValue || getRandomLetter(),
      },
    });
  };
  return (
    <AutocompleteInput<AhsSearchDataFragment>
      items={searchResults}
      itemToString={(item) => item?.name ?? ""}
      onInputValueChange={handleInputValueChange}
      onSelectedItemChange={onSelectedItemChange}
    >
      Link to
    </AutocompleteInput>
  );
};

const getRandomLetter = () =>
  String.fromCharCode(97 + Math.floor(Math.random() * 26));
