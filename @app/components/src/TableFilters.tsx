import { below, Space } from "@app/design";
import { matchSorter } from "match-sorter";
import React from "react";
import type { FilterValue, Row } from "react-table";
import { useAsyncDebounce } from "react-table";
import styled from "styled-components";

import { lengthToNumber } from "./util";

type GlobalFilterProps<T extends object> = {
  preGlobalFilteredRows: Row<T>[];
  globalFilter: any;
  setGlobalFilter: (filterValue: FilterValue) => void;
};
function GlobalFilter<T extends object>({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}: GlobalFilterProps<T>) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <Space block>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{ width: "100%" }}
      />
    </Space>
  );
}

type DefaultColumnFilterProps<T extends object> = {
  column: {
    filterValue: FilterValue;
    preFilteredRows: Row<T>[];
    setFilter: (
      updater: ((filterValue: FilterValue) => FilterValue) | FilterValue
    ) => void;
  };
};
function DefaultColumnFilter<T extends object>({
  column: { filterValue, preFilteredRows, setFilter },
}: DefaultColumnFilterProps<T>) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Search ${count} records...`}
      style={{ width: "100%" }}
    />
  );
}

type SelectColumnFilterProps<T extends object> = {
  column: {
    filterValue: FilterValue;
    preFilteredRows: Row<T>[];
    setFilter: (
      updater: ((filterValue: FilterValue) => FilterValue) | FilterValue
    ) => void;
    id: string;
  };
};

function SelectColumnFilter<T extends object>({
  column: { filterValue, setFilter, preFilteredRows, id },
}: SelectColumnFilterProps<T>) {
  const options = React.useMemo(() => {
    let options = new Set(
      preFilteredRows
        .map((row) => (Boolean(row.values[id]) ? row.values[id] : null))
        .sort()
    );
    return Array.from(options.values()) as HTMLOptionElement["value"][];
  }, [id, preFilteredRows]);
  switch (id) {
    case "fragrance": {
    }
  }
  return (
    <select
      value={filterValue ? filterValue : "all"}
      onChange={(e) => {
        setFilter(e.target.value);
      }}
      style={{ width: "100%" }}
    >
      <option value="all">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

type NumberRangeColumnFilterProps<T extends object> = {
  column: {
    filterValue: FilterValue;
    preFilteredRows: Row<T>[];
    setFilter: (
      updater: ((filterValue: FilterValue) => FilterValue) | FilterValue
    ) => void;
    id: string;
  };
};

function NumberRangeColumnFilter<T extends object>({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}: NumberRangeColumnFilterProps<T>) {
  const rowsWithValue = preFilteredRows.filter((row) => {
    return (
      row.values[id] !== null &&
      row.values[id] !== undefined &&
      row.values[id] !== ""
    );
  });
  const [min, max] = React.useMemo(() => {
    let min: number;
    let max: number;
    if (id === "bloomSize" || id === "scapeHeight") {
      const value = rowsWithValue.length
        ? lengthToNumber(rowsWithValue[0].values[id])
        : 0;
      min = value;
      max = value;
    } else {
      const value = rowsWithValue.length ? rowsWithValue[0].values[id] : 0;
      min = value;
      max = value;
    }
    rowsWithValue.forEach((row) => {
      if (id === "bloomSize" || id === "scapeHeight") {
        const value = lengthToNumber(row.values[id]);
        min = Math.min(value, min);
        max = Math.max(value, max);
      } else {
        const value = row.values[id];
        min = Math.min(value, min);
        max = Math.max(value, max);
      }
    });
    return [min, max];
  }, [id, rowsWithValue]);

  return (
    <RangeWrapper>
      <input
        value={filterValue[0] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;

          setFilter((old = []) => [
            val ? parseInt(val, 10) : undefined,
            old[1],
          ]);
        }}
        placeholder={`Min (${min})`}
      />
      <input
        value={filterValue[1] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? parseInt(val, 10) : undefined,
          ]);
        }}
        placeholder={`Max (${max})`}
      />
    </RangeWrapper>
  );
}

const RangeWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--size-1);
  ${below.md`
    grid-template-columns: 1fr;
  `}
`;

function textFilter<T extends object>(
  rows: Row<T>[],
  id: any,
  filterValue: FilterValue
) {
  return rows.filter((row: any) => {
    const rowValue = row.values[id]
      ? String(row.values[id]).toLowerCase()
      : "__none";
    const filterString = filterValue
      ? String(filterValue).toLowerCase()
      : "__none";
    const isMatch =
      filterString === "all" ||
      (!rowValue && !filterString) ||
      rowValue == filterString ||
      rowValue.startsWith(filterString);
    return isMatch;
  });
}

function betweenLengthFilter<T extends object>(
  rows: Row<T>[],
  id: any,
  filterValue: FilterValue
) {
  const min = filterValue[0] || Number.MIN_SAFE_INTEGER;
  const max = filterValue[1] || Number.MAX_SAFE_INTEGER;
  return rows.filter((row) => {
    const rowValue = row.values[id];
    const inches = lengthToNumber(rowValue);
    return isNaN(inches) ? false : inches >= min && inches <= max;
  });
}

function fuzzyTextFilterFn<T extends object>(
  rows: Row<T>[],
  id: any,
  filterValue: FilterValue
) {
  return matchSorter(rows, filterValue, {
    keys: [(row) => row.values[id]],
  });
}
fuzzyTextFilterFn.autoRemove = (val: string) => !val;

function filterGreaterThan<T extends object>(
  rows: Row<T>[],
  id: string,
  filterValue: FilterValue
) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}
filterGreaterThan.autoRemove = (val: unknown) => typeof val !== "number";

export {
  betweenLengthFilter,
  DefaultColumnFilter,
  filterGreaterThan,
  fuzzyTextFilterFn,
  GlobalFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
  textFilter,
};
