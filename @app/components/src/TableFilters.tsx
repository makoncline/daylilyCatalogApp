import { Space } from "@app/design";
import { matchSorter } from "match-sorter";
import React from "react";
import type { FilterValue, Row } from "react-table";
import { useAsyncDebounce } from "react-table";

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
    <Space>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
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
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...Array.from(options.values())] as HTMLOptionElement["value"][];
  }, [id, preFilteredRows]);

  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
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
    <Space gap="none">
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
      -
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
    </Space>
  );
}

function textFilter<T extends object>(
  rows: Row<T>[],
  id: string,
  filterValue: FilterValue
) {
  return rows.filter((row: any) => {
    const rowValue = row.values[id];
    return rowValue !== undefined
      ? String(rowValue)
          .toLowerCase()
          .startsWith(String(filterValue).toLowerCase())
      : true;
  });
}

function betweenLengthFilter<T extends object>(
  rows: Row<T>[],
  id: string,
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
  id: string,
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
