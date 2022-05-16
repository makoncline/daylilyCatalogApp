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
  price: any;
  publicNote: Maybe<string>;
  privateNote: Maybe<string>;
  createdAt: string;
  updatedAt: string;
  list: string | null;
  bloomHabit: string | null;
  bloomSeason: string | null;
  bloomSize: string | null;
  branches: string | null;
  budcount: string | null;
  color: string | null;
  flower: string | null;
  foliage: string | null;
  foliageType: string | null;
  form: string | null;
  fragrance: string | null;
  hybridizer: string | null;
  registeredName: string | null;
  parentage: string | null;
  ploidy: string | null;
  scapeHeight: string | null;
  sculpting: string | null;
  seedlingNum: string | null;
  year: string | null;
};

const useReactTable = ({ rawData }: { rawData: LilyDataFragment[] }) => {
  const data: ListingRow[] = React.useMemo(
    () =>
      rawData.slice(0, 10).map((row) => {
        const {
          id,
          name,
          imgUrl,
          publicNote,
          privateNote,
          price,
          createdAt,
          updatedAt,
          list,
          ahsDatumByAhsRef,
        } = row;
        const { name: listName } = list || {};
        const {
          bloomHabit,
          bloomSeason,
          bloomSize,
          branches,
          budcount,
          color,
          flower,
          foliage,
          foliageType,
          form,
          fragrance,
          hybridizer,
          name: registeredName,
          parentage,
          ploidy,
          scapeHeight,
          sculpting,
          seedlingNum,
          year,
        } = ahsDatumByAhsRef || {};
        return {
          id: id,
          name: name,
          imgUrl: imgUrl || [],
          price: price,
          publicNote: publicNote,
          privateNote: privateNote,
          createdAt: createdAt,
          updatedAt: updatedAt,
          list: listName || null,
          bloomHabit: bloomHabit || null,
          bloomSeason: bloomSeason || null,
          bloomSize: bloomSize || null,
          branches: branches || null,
          budcount: budcount || null,
          color: color || null,
          flower: flower || null,
          foliage: foliage || null,
          foliageType: foliageType || null,
          form: form || null,
          fragrance: fragrance || null,
          hybridizer: hybridizer || null,
          registeredName: registeredName || null,
          parentage: parentage || null,
          ploidy: ploidy || null,
          scapeHeight: scapeHeight || null,
          sculpting: sculpting || null,
          seedlingNum: seedlingNum || null,
          year: year || null,
        };
      }),
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
        Cell: Truncate,
        filter: "fuzzyText",
      },
      {
        Header: "Private note",
        accessor: "privateNote",
        Cell: Truncate,
        filter: "fuzzyText",
      },
      {
        Header: "Created at",
        accessor: "createdAt",
        filter: undefined,
        Cell: DateDisplay,
      },
      {
        Header: "Updated at",
        accessor: "updatedAt",
        filter: undefined,
        Cell: DateDisplay,
      },
      {
        Header: "List",
        accessor: "list",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Bloom habit",
        accessor: "bloomHabit",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Bloom season",
        accessor: "bloomSeason",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Bloom size",
        accessor: "bloomSize",
        Filter: NumberRangeColumnFilter,
        filter: "betweenLength",
      },
      {
        Header: "Branches",
        accessor: "branches",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Budcount",
        accessor: "budcount",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      {
        Header: "Color",
        accessor: "color",
        filter: "fuzzyText",
        Cell: Truncate,
      },
      { Header: "Flower", accessor: "flower", Filter: SelectColumnFilter },
      { Header: "Foliage", accessor: "foliage", Filter: SelectColumnFilter },
      {
        Header: "Foliage type",
        accessor: "foliageType",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Form",
        accessor: "form",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Fragrance",
        accessor: "fragrance",
        Filter: SelectColumnFilter,
      },
      { Header: "Hybridizer", accessor: "hybridizer", filter: "fuzzyText" },
      {
        Header: "Registered name",
        accessor: "registeredName",
        filter: "fuzzyText",
      },
      {
        Header: "Parentage",
        accessor: "parentage",
        filter: "fuzzyText",
      },
      { Header: "Ploidy", accessor: "ploidy", Filter: SelectColumnFilter },
      {
        Header: "Scape height",
        accessor: "scapeHeight",
        Filter: NumberRangeColumnFilter,
        filter: "betweenLength",
      },
      {
        Header: "Sculpting",
        accessor: "sculpting",
        Filter: SelectColumnFilter,
      },
      { Header: "Seedling #", accessor: "seedlingNum", filter: "fuzzyText" },
      {
        Header: "Year",
        accessor: "year",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
    ],
    []
  );

  const filterTypes = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
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
      betweenLength: (
        rows: any,
        id: any,
        filterValue: [number | undefined, number | undefined]
      ) => {
        const min = filterValue[0] || Number.MIN_SAFE_INTEGER;
        const max = filterValue[1] || Number.MAX_SAFE_INTEGER;
        return rows.filter((row: any) => {
          const rowValue = row.values[id];
          const inches = lengthToNumber(rowValue);
          return isNaN(inches) ? false : inches >= min && inches <= max;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
      // eslint-disable-next-line react/display-name
      Cell: ({ value }: { value: string }) => (
        <LimitLength>{value}</LimitLength>
      ),
    }),
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      initialState: {
        hiddenColumns: [
          // "list",
          // "registeredName",
          // "hybridizer",
          // "year",
          // "parentage",
          // "ploidy",
          // "scapeHeight",
          // "bloomSize",
          // "bloomHabit",
          // "bloomSeason",
          // "budcount",
          // "branches",
          // "color",
          // "flower",
          // "foliage",
          // "foliageType",
          // "form",
          // "fragrance",
          // "sculpting",
          // "seedlingNum",
          // "createdAt",
          // "updatedAt",
        ],
      },
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
    allColumns,
  } = useReactTable({
    rawData: dataSource,
  });

  function handleClick(id: number) {
    const url = toViewListingUrl(id);
    router.push(`${url}`);
  }

  return (
    <>
      <SelectColumns>
        <summary>Select columns</summary>
        <ColumnGrid>
          {allColumns.map((column) => (
            <div key={column.id}>
              <label>
                <input type="checkbox" {...column.getToggleHiddenProps()} />{" "}
                {column.Header}
              </label>
            </div>
          ))}
        </ColumnGrid>
      </SelectColumns>
      <TableWrapper>
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
                      <NoWrap>{column.render("Header")}</NoWrap>
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </Space>
                    <div>
                      {column.canFilter ? column.render("Filter") : null}
                    </div>
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
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </StyledTable>
      </TableWrapper>
    </>
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

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}: any) {
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

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: any) {
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row: any) => {
      options.add(row.values[id]);
    });
    return [...Array.from(options.values())];
  }, [id, preFilteredRows]);

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

function lengthToNumber(length: string) {
  return parseInt((length || "").replace(/(^\d+(\.\d+)?)(.+$)/i, "$1"), 10);
}
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}: any) {
  const [min, max] = React.useMemo(() => {
    let min: number;
    let max: number;
    if (id === "bloomSize" || id === "scapeHeight") {
      min = preFilteredRows.length
        ? lengthToNumber(preFilteredRows[0].values[id])
        : 0;
      max = preFilteredRows.length
        ? lengthToNumber(preFilteredRows[0].values[id])
        : 0;
    } else {
      min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
      max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    }
    preFilteredRows.forEach((row: any) => {
      if (id === "bloomSize" || id === "scapeHeight") {
        min = Math.min(lengthToNumber(row.values[id]), min);
        max = Math.max(lengthToNumber(row.values[id]), max);
      } else {
        min = Math.min(row.values[id], min);
        max = Math.max(row.values[id], max);
      }
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

function DateDisplay({ value }: { value: string }) {
  return (
    <LimitLength>{new Date(value).toLocaleDateString("en-US")}</LimitLength>
  );
}
function Truncate({ value }: { value: string }) {
  return <LimitLength>{truncate(value || "")}</LimitLength>;
}
const LimitLength = styled.div`
  max-width: 300px;
  width: max-content;
`;

const SelectColumns = styled.details`
  width: 100%;
`;
const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;
const NoWrap = styled.span`
  white-space: nowrap;
`;

const TableWrapper = styled.div`
  align-self: flex-start;
`;
const StyledTable = styled.table`
  border-collapse: collapse;
  align-self: flex-start;
  position: relative;
  z-index: 0;
  thead {
    position: relative;
    z-index: 1;
    tr {
      vertical-align: bottom;
    }
    th {
      padding: var(--size-2);
      text-align: left;
      min-width: 150px;
    }
    tr:last-child {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--surface-1);
      th:first-child {
        position: sticky;
        left: 0;
        z-index: 2;
        background: var(--surface-1);
      }
    }
  }
  tbody {
    position: relative;
    z-index: 0;
    td {
      padding: 0 var(--size-2);
    }
    tr {
      cursor: pointer;

      td:first-child {
        position: sticky;
        left: 0;
        z-index: 1;
        background: var(--surface-1);
      }
      :hover {
        td {
          background: var(--surface-2);
        }
      }
    }
  }
  input,
  select {
    font-size: var(--font-size-0);
    padding-inline: var(--size-1);
    width: 100%;
    min-width: 10px;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &[type="number"] {
      -moz-appearance: textfield;
      min-width: 75px;
    }
  }
`;
