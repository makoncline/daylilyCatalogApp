import { Space } from "@app/design";
import { AhsDataFragment, LilyDataFragment } from "@app/graphql";
import { toViewListingUrl } from "@app/lib";
import router from "next/router";
import React from "react";
import type { Column, FilterTypes } from "react-table";
import {
  useColumnOrder,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useTable,
} from "react-table";
import styled from "styled-components";

import { DateCell, ImageCell, LimitWidth, TruncateCell } from "./TableCells";
import {
  betweenLengthFilter,
  DefaultColumnFilter,
  fuzzyTextFilterFn,
  GlobalFilter,
  NumberRangeColumnFilter,
  SelectColumnFilter,
  textFilter,
} from "./TableFilters";
import { currency } from "./util";

type ListingRow = Omit<
  LilyDataFragment,
  "__typename" | "list" | "ahsDatumByAhsRef" | "ahsId"
> &
  Omit<AhsDataFragment, "__typename" | "name" | "ahsId"> & {
    list?: string | null;
    registeredName?: string | null;
  };

const useReactTable = ({ rawData }: { rawData: LilyDataFragment[] }) => {
  const data: ListingRow[] = React.useMemo(
    () =>
      rawData.slice(0, 10).map((row) => {
        const rowDataOrNull = Object.entries(row).reduce(
          (acc, [key, value]) => {
            acc[key] = value || null;
            return acc;
          },
          {} as LilyDataFragment
        );
        const ahsDataOrNull = Object.entries(row.ahsDatumByAhsRef || {}).reduce(
          (acc, [key, value]) => {
            acc[key] = value || null;
            return acc;
          },
          {} as AhsDataFragment
        );
        return {
          ...ahsDataOrNull,
          registeredName: ahsDataOrNull.name,
          ...rowDataOrNull,
          list: row.list?.name || null,
        };
      }),
    [rawData]
  );
  const columns: Column<ListingRow>[] = React.useMemo(
    () => [
      {
        Header: "Listing name",
        accessor: "name",
        filter: "fuzzyText",
      },
      {
        Header: "Image",
        accessor: "imgUrl",
        Cell: ImageCell,
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
        Cell: TruncateCell,
        filter: "fuzzyText",
      },
      {
        Header: "Private note",
        accessor: "privateNote",
        Cell: TruncateCell,
        filter: "fuzzyText",
      },
      {
        Header: "List",
        accessor: "list",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Registered name",
        accessor: "registeredName",
        filter: "fuzzyText",
      },
      { Header: "Hybridizer", accessor: "hybridizer", filter: "fuzzyText" },
      {
        Header: "Year",
        accessor: "year",
        Filter: NumberRangeColumnFilter,
        filter: "between",
      },
      { Header: "Ploidy", accessor: "ploidy", Filter: SelectColumnFilter },
      {
        Header: "Scape height",
        accessor: "scapeHeight",
        Filter: NumberRangeColumnFilter,
        filter: "betweenLength",
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
        Cell: TruncateCell,
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
      {
        Header: "Parentage",
        accessor: "parentage",
        filter: "fuzzyText",
      },
      { Header: "Seedling #", accessor: "seedlingNum", filter: "fuzzyText" },
      {
        Header: "Sculpting",
        accessor: "sculpting",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Created at",
        accessor: "createdAt",
        filter: undefined,
        Cell: DateCell,
      },
      {
        Header: "Updated at",
        accessor: "updatedAt",
        filter: undefined,
        Cell: DateCell,
      },
    ],
    []
  );

  const filterTypes: FilterTypes<ListingRow> = React.useMemo(
    () => ({
      fuzzyText: fuzzyTextFilterFn,
      text: textFilter,
      betweenLength: betweenLengthFilter,
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
      // eslint-disable-next-line react/display-name
      Cell: ({ value }: { value: string }) => <LimitWidth>{value}</LimitWidth>,
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
        columnOrder: [
          "name",
          "imgUrl",
          "price",
          "publicNote",
          "privateNote",
          "list",
          "registeredName",
          "hybridizer",
          "year",
          "ploidy",
          "scapeHeight",
          "bloomSize",
          "branches",
          "budcount",
          "color",
          "bloomHabit",
          "bloomSeason",
          "flower",
          "foliage",
          "foliageType",
          "form",
          "fragrance",
          "parentage",
          "seedlingNum",
          "sculpting",
          "createdAt",
          "updatedAt",
        ],
        hiddenColumns: [
          "registeredName",
          "hybridizer",
          "year",
          "parentage",
          "ploidy",
          "scapeHeight",
          "bloomSize",
          "bloomHabit",
          "bloomSeason",
          "budcount",
          "branches",
          "color",
          "flower",
          "foliage",
          "foliageType",
          "form",
          "fragrance",
          "sculpting",
          "seedlingNum",
          "createdAt",
          "updatedAt",
        ],
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useColumnOrder
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
              // eslint-disable-next-line react/jsx-key
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
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
                // eslint-disable-next-line react/jsx-key
                <tr
                  {...row.getRowProps()}
                  onClick={() => handleClick(row.original.id)}
                >
                  {row.cells.map((cell) => {
                    return (
                      // eslint-disable-next-line react/jsx-key
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
