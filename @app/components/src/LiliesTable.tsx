/* eslint-disable react/jsx-key */
import { Space, Thumbnail } from "@app/design";
import { LilyDataFragment, Maybe } from "@app/graphql";
import { toViewListingUrl } from "@app/lib";
import { matchSorter } from "match-sorter";
import Image from "next/image";
import router from "next/router";
import React from "react";
import type { Column } from "react-table";
import {
  useAsyncDebounce,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useTable,
} from "react-table";
import styled from "styled-components";

import { truncate } from "./util";

type ListingRow = {
  id: number;
  name: string;
  imgUrl: Maybe<String>[];
  list: string | null;
  publicNote: Maybe<string>;
  privateNote: Maybe<string>;
  price: any;
};

const useReactTable = ({ rawData }: { rawData: LilyDataFragment[] }) => {
  const data: ListingRow[] = React.useMemo(
    () =>
      rawData.slice(0, 10).map((row) => ({
        id: row.id,
        name: row.name,
        imgUrl: row.imgUrl || [],
        list: row.list?.name || null,
        publicNote: row.publicNote,
        privateNote: row.privateNote,
        price: row.price,
      })),
    [rawData]
  );
  const columns: Column<ListingRow>[] = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        filter: "fuzzyText",
      },
      {
        Header: "Image",
        accessor: "imgUrl",
        // eslint-disable-next-line react/display-name
        Cell: ({ value }) => (
          <Thumbnail>
            <Image
              src={value.length > 0 ? value[0] : "/flowerPlaceholder.png"}
            />
          </Thumbnail>
        ),
        filter: undefined,
      },
      {
        Header: "Price",

        accessor: "price",
        Cell: ({ value }) => (value > 0 ? currency(value) : "-"),
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Public note",
        accessor: "publicNote",
        Cell: ({ value }) => truncate(value || ""),
        filter: "fuzzyText",
      },
      {
        Header: "Private note",
        accessor: "privateNote",
        Cell: ({ value }) => truncate(value || ""),
        filter: "fuzzyText",
      },
    ],
    []
  );

  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows: any, id: any, filterValue: any) => {
        return rows.filter((row: any) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  return tableInstance;
};

export function LiliesTable({
  dataSource,
}: {
  dataSource: LilyDataFragment[];
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useReactTable({
    rawData: dataSource,
  });

  function handleClick(id: number) {
    const url = toViewListingUrl(id);
    console.log(url);
    router.push(`${url}`);
  }
  return (
    <StyledTable {...getTableProps()}>
      <thead>
        <tr>
          <th colSpan={visibleColumns.length}>
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </th>
        </tr>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>
                <Space
                  {...column.getSortByToggleProps()}
                  style={{ "--direction": "row" }}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </Space>
                <div>{column.canFilter ? column.render("Filter") : null}</div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr
              {...row.getRowProps()}
              onClick={() => handleClick(row.original.id)}
            >
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
}

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}: any) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
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
    </span>
  );
}

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}: any) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: any) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row: any) => {
      options.add(row.values[id]);
    });
    return [...Array.from(options.values())];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option: any, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}: any) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row: any) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

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

function fuzzyTextFilterFn(rows: any, id: any, filterValue: any) {
  return matchSorter(rows, filterValue, {
    keys: [(row: any) => row.values[id]],
  });
}
fuzzyTextFilterFn.autoRemove = (val: string) => !val;
function filterGreaterThan(rows: any, id: any, filterValue: any) {
  return rows.filter((row: any) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}
filterGreaterThan.autoRemove = (val: unknown) => typeof val !== "number";

const currency = (input: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(input);

const StyledTable = styled.table`
  border-collapse: collapse;
  thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--surface-1);
  }
  thead::after {
    content: "";
    position: absolute;
    top: -1px;
    width: 100%;
    height: 100%;
    pointer-events: none;
    border-bottom: var(--hairline);
  }
  th {
    padding: var(--size-2);
    text-align: left;
  }
  td {
    padding: 0 var(--size-2);
  }
  tbody tr {
    cursor: pointer;
  }
  tbody tr:hover {
    background: var(--surface-2);
  }
  input {
    font-size: var(--font-size-0);
    padding-inline: var(--size-1);
    width: 100%;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &[type="number"] {
      -moz-appearance: textfield;
      width: 50%;
    }
  }
`;
