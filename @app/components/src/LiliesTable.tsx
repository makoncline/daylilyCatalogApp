import { above, Button, Space, useLocalStorage } from "@app/design";
import { AhsDataFragment, LilyDataFragment } from "@app/graphql";
import { toViewListingUrl } from "@app/lib";
import router from "next/router";
import React from "react";
import type { Column, FilterTypes } from "react-table";
import {
  useColumnOrder,
  useFilters,
  useGlobalFilter,
  usePagination,
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
import { currency, download } from "./util";

type ListingRow = Omit<
  LilyDataFragment,
  "__typename" | "list" | "ahsDatumByAhsRef" | "ahsId"
> &
  Omit<AhsDataFragment, "__typename" | "name" | "ahsId"> & {
    list?: string | null;
    registeredName?: string | null;
  };

const defaultColumnOrder = [
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
];

const defaultHiddenColumns = [
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
];

const useReactTable = ({ rawData }: { rawData: LilyDataFragment[] }) => {
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    "columnOrder",
    defaultColumnOrder
  );
  const [hiddenColumns, setHiddenColumns] = useLocalStorage<string[]>(
    "hiddenColumns",
    defaultHiddenColumns
  );

  const data: ListingRow[] = React.useMemo(
    () =>
      rawData.map((row) => {
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
        const images = [
          ...(rowDataOrNull.imgUrl || []),
          ahsDataOrNull.image,
        ].filter(Boolean);
        return {
          ...ahsDataOrNull,
          registeredName: ahsDataOrNull.name,
          ...rowDataOrNull,
          list: row.list?.name || null,
          imgUrl: images,
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
        columnOrder,
        hiddenColumns,
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useColumnOrder,
    usePagination
  );

  React.useEffect(() => {
    tableInstance.setColumnOrder(columnOrder);
  }, [columnOrder, tableInstance]);
  React.useEffect(() => {
    tableInstance.setHiddenColumns(hiddenColumns);
  }, [hiddenColumns, tableInstance]);

  return {
    tableInstance,
    setColumnOrder: (columnOrder: string[]) => {
      setColumnOrder(columnOrder);
      tableInstance.setColumnOrder(columnOrder);
    },
    setHiddenColumns: (hidenColumns: string[]) => {
      setHiddenColumns(hidenColumns);
      tableInstance.setHiddenColumns(hidenColumns);
    },
    columnOrder,
    hiddenColumns,
    resetToDefault: () => {
      setColumnOrder(defaultColumnOrder);
      setHiddenColumns(defaultHiddenColumns);
    },
  };
};

const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key.toLowerCase() === "enter") {
    event.currentTarget.blur();
  }
};

export function LiliesTable({
  dataSource,
}: {
  dataSource: LilyDataFragment[];
}) {
  const {
    tableInstance: {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      state,
      visibleColumns,
      preGlobalFilteredRows,
      setGlobalFilter,
      allColumns,
      setColumnOrder: rtSetColumnOrder,
      page,
      canPreviousPage,
      canNextPage,
      pageOptions,
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
      state: { pageIndex, pageSize },
    },
    setColumnOrder,
    columnOrder,
    setHiddenColumns,
    hiddenColumns,
    resetToDefault,
  } = useReactTable({
    rawData: dataSource,
  });

  function handleClick(id: number) {
    const url = toViewListingUrl(id);
    router.push(`${url}`);
  }

  const rtColumnOrder = allColumns.map((column) => column.id);
  const rtHidenColumns = allColumns
    .filter((column) => !visibleColumns.includes(column))
    .map((column) => column.id);
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setColumnOrder(rtColumnOrder);
    setHiddenColumns(rtHidenColumns);
  }

  function handleMove(direction: "<" | ">", index: number) {
    const newColumnOrder = [...rtColumnOrder];
    const [moved] = newColumnOrder.splice(index, 1);
    if (direction === "<") {
      newColumnOrder.splice(index - 1, 0, moved);
    } else {
      newColumnOrder.splice(index + 1, 0, moved);
    }
    rtSetColumnOrder(newColumnOrder);
  }

  function Pagination() {
    return (
      <Space
        block
        responsive
        style={{ alignItems: "center", justifyContent: "flex-end" }}
      >
        <Space center>
          <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </Button>{" "}
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {"<"}
          </Button>{" "}
          <Button onClick={() => nextPage()} disabled={!canNextPage}>
            {">"}
          </Button>{" "}
          <Button
            onClick={() => gotoPage(pageOptions.length - 1)}
            disabled={!canNextPage}
          >
            {">>"}
          </Button>{" "}
        </Space>
        <Space center>
          <span>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <span>
            | Go to page:{" "}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onKeyDown={handleEnter}
              onBlur={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: "100px" }}
            />
          </span>{" "}
        </Space>
        <Space center>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Space>
      </Space>
    );
  }

  return (
    <>
      <SelectColumns>
        <summary>Edit listing table</summary>
        <form onSubmit={handleSubmit}>
          <Space direction="column">
            <ColumnGrid>
              {allColumns.map((column, index) => (
                <div key={column.id}>
                  <label>
                    <input
                      type="checkbox"
                      id={column.id}
                      {...column.getToggleHiddenProps()}
                    />{" "}
                    {column.Header}
                    <StyledButton
                      onClick={() => handleMove("<", index)}
                      styleType="text"
                    >
                      ◀️
                    </StyledButton>
                    <StyledButton
                      onClick={() => handleMove(">", index)}
                      styleType="text"
                    >
                      ▶️
                    </StyledButton>
                  </label>
                </div>
              ))}
            </ColumnGrid>
            <Space>
              <Button
                type="submit"
                styleType="primary"
                disabled={
                  JSON.stringify(columnOrder) ==
                    JSON.stringify(rtColumnOrder) &&
                  JSON.stringify(hiddenColumns) ==
                    JSON.stringify(rtHidenColumns)
                }
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to reset column order and visibility to the default?"
                    )
                  ) {
                    resetToDefault();
                  }
                }}
                styleType="text"
                danger
              >
                Reset to default
              </Button>
            </Space>
          </Space>
        </form>
      </SelectColumns>
      <Pagination />
      <TableWrapper>
        <StyledTable {...getTableProps()}>
          <thead>
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
            <tr>
              <th colSpan={3}>
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={state.globalFilter}
                  setGlobalFilter={setGlobalFilter}
                />
              </th>
              {Array(visibleColumns.length > 3 ? visibleColumns.length - 3 : 0)
                .fill(0)
                .map((_, i) => (
                  <th key={i} />
                ))}
            </tr>
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              const id = row.original.id;
              return (
                // eslint-disable-next-line react/jsx-key
                <tr {...row.getRowProps()} onClick={() => handleClick(id)}>
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
      <Pagination />
      <Space block style={{ justifyContent: "flex-end" }}>
        <Button onClick={() => download(dataSource)}>
          Download listing data
        </Button>
      </Space>
    </>
  );
}

const StyledButton = styled(Button)`
  padding: 0 var(--size-1);
`;

const SelectColumns = styled.details`
  width: 100%;
`;
const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;
const NoWrap = styled.span`
  white-space: nowrap;
`;

const TableWrapper = styled.div`
  align-self: flex-start;
  width: 100%;
  height: 100vh;
  max-width: var(--full-width);
  overflow: scroll;
`;
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  align-self: flex-start;
  position: relative;
  z-index: 0;
  thead {
    position: relative;
    z-index: 1;
    background: var(--surface-1);
    tr {
      vertical-align: bottom;
    }
    th {
      padding: var(--size-2);
      text-align: left;
      min-width: 150px;
    }
    position: sticky;
    top: 0;
    z-index: 1;
    th:first-child {
      ${above.sm`
        position: sticky;
        left: 0;
        z-index: 2;
        background: var(--surface-1);
      `}
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
        ${above.sm`
          position: sticky;
          left: 0;
          z-index: 1;
          background: var(--surface-1);
        `}
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
