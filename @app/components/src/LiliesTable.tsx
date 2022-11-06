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

import { ListingCard } from "./ListingCard";
import { Pagination } from "./Pagination";
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
    privateNote?: string | null;
    list?: string | null;
    registeredName?: string | null;
    description: string | null;
  };

const defaultColumnOrder = [
  "name",
  "imgUrl",
  "description",
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

const useReactTable = ({
  rawData,
  isOwner,
}: {
  rawData: LilyDataFragment[];
  isOwner: boolean;
}) => {
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
      rawData
        .map((row) => {
          const rowDataOrNull = Object.entries(row).reduce(
            (acc, [key, value]) => {
              acc[key] = value || null;
              return acc;
            },
            {} as LilyDataFragment
          );
          const ahsDataOrNull = Object.entries(
            row.ahsDatumByAhsRef || {}
          ).reduce((acc, [key, value]) => {
            acc[key] = value || null;
            return acc;
          }, {} as AhsDataFragment);
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
            description: row.ahsDatumByAhsRef
              ? getAhsDescription(row.ahsDatumByAhsRef)
              : null,
          };
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1)),
    [rawData]
  );
  const columns: Column<ListingRow>[] = React.useMemo(() => {
    const ownerColumns: Column<ListingRow>[] = [
      {
        Header: "Private note",
        accessor: "privateNote",
        Cell: TruncateCell,
        filter: "fuzzyText",
      },
    ];
    const publicColumns: Column<ListingRow>[] = [
      {
        Header: "Listing name",
        accessor: "name",
        filter: "fuzzyText",
      },
      {
        Header: "Image",
        accessor: "imgUrl",
        Cell: ImageCell,
        disableFilters: true,
        sortType: "basic",
        sortInverted: true,
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
        Header: "List",
        accessor: "list",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Registered name",
        accessor: "registeredName",
        filter: "fuzzyText",
      },
      {
        Header: "Hybridizer",
        accessor: "hybridizer",
        filter: "fuzzyText",
      },
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
        filter: "text",
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
      {
        Header: "Seedling #",
        accessor: "seedlingNum",
        filter: "fuzzyText",
      },
      {
        Header: "Sculpting",
        accessor: "sculpting",
        Filter: SelectColumnFilter,
      },
      {
        Header: "Created at",
        accessor: "createdAt",
        Cell: DateCell,
        disableFilters: true,
      },
      {
        Header: "Updated at",
        accessor: "updatedAt",
        Cell: DateCell,
        disableFilters: true,
      },
      {
        Header: "Description",
        accessor: "description",
        filter: "fuzzyText",
      },
    ];
    return isOwner ? [...publicColumns, ...ownerColumns] : publicColumns;
  }, [isOwner]);

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
  const publicColumns = [
    "name",
    "price",
    "publicNote",
    "list",
    "imgUrl",
    "createdAt",
    "updatedAt",
  ];

  const tableInstance = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      initialState: {
        columnOrder,
        hiddenColumns: isOwner
          ? hiddenColumns
          : columnOrder.filter((col) => !publicColumns.includes(col)),
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useColumnOrder,
    usePagination
  );

  React.useEffect(() => {
    if (isOwner) {
      tableInstance.setColumnOrder(columnOrder);
    }
  }, [columnOrder, isOwner, tableInstance]);
  React.useEffect(() => {
    if (isOwner) {
      tableInstance.setHiddenColumns(hiddenColumns);
    }
  }, [hiddenColumns, isOwner, tableInstance]);

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
    hiddenColumns: isOwner
      ? hiddenColumns
      : columnOrder.filter((col) => !publicColumns.includes(col)),
    resetToDefault: () => {
      setColumnOrder(defaultColumnOrder);
      setHiddenColumns(defaultHiddenColumns);
    },
  };
};

export function LiliesTable({
  dataSource,
  isOwner,
}: {
  dataSource: LilyDataFragment[];
  isOwner: boolean;
}) {
  const [showBasicDisplay, setShowBasicDisplay] = useLocalStorage<boolean>(
    "showBasicDisplay",
    true
  );
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
      setAllFilters,
    },
    setColumnOrder,
    columnOrder,
    setHiddenColumns,
    hiddenColumns,
    resetToDefault,
  } = useReactTable({
    rawData: dataSource,
    isOwner,
  });

  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  React.useEffect(() => {
    if (mounted.current && pageIndex) {
      scrollToTop();
    }
  }, [pageIndex]);

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

  return (
    <Space direction="column" id="top-of-table" block>
      {!showBasicDisplay && isOwner && (
        <StyledDetails>
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
        </StyledDetails>
      )}
      <StyledDetails>
        <summary>Sort and filter listings</summary>
        <Space direction="column">
          <table>
            <tbody>
              {[
                ...visibleColumns.filter((col) => col.canFilter),
                ...visibleColumns.filter((col) => !col.canFilter),
              ]
                .filter((col) => col.canFilter || col.canSort)
                .map((column) => (
                  <tr style={{ verticalAlign: "top" }} key={column.id}>
                    <td>
                      <Space {...column.getSortByToggleProps()}>
                        <NoWrap>{column.render("Header")}</NoWrap>
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      </Space>
                    </td>
                    {column.canFilter && <td>{column.render("Filter")}</td>}
                  </tr>
                ))}
            </tbody>
          </table>
          <Button onClick={() => setAllFilters([])}>Reset all filters</Button>
        </Space>
      </StyledDetails>
      {isOwner && (
        <Space block>
          <Button
            onClick={() => {
              setShowBasicDisplay(!showBasicDisplay);
            }}
          >
            {showBasicDisplay
              ? "Switch to advanced view"
              : "Switch to basic view"}
          </Button>
        </Space>
      )}
      <Pagination
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        pageOptions={pageOptions}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
        setPageSize={setPageSize}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
      {(showBasicDisplay || !isOwner) && (
        <Space direction="column">
          {page.map((row) => {
            prepareRow(row);
            const { id, name, publicNote, price, imgUrl, description } =
              row.original;
            return (
              <ListingCard
                key={`${id}${showBasicDisplay}`}
                id={id}
                name={name}
                note={publicNote}
                price={price}
                image={imgUrl ? imgUrl[0] : null}
                description={description}
              />
            );
          })}
        </Space>
      )}
      {!showBasicDisplay && isOwner && (
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
      )}
      <Pagination
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        pageOptions={pageOptions}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
        setPageSize={setPageSize}
        pageIndex={pageIndex}
        pageSize={pageSize}
      />
      <Space block style={{ justifyContent: "flex-end" }}>
        {isOwner && (
          <Button onClick={() => download(dataSource)}>
            Download listing data
          </Button>
        )}
        <Button onClick={() => scrollToTop()}>Return to top</Button>
      </Space>
    </Space>
  );
}

function scrollToTop() {
  document?.getElementById("top-of-table")?.scrollIntoView({
    behavior: "smooth",
  });
}

function getAhsDescription(ahsData: AhsDataFragment) {
  const descriptionProperties: (keyof AhsDataFragment)[] = [
    "hybridizer",
    "year",
    "ploidy",
    "foliageType",
    "color",
  ];
  let description = "";
  descriptionProperties.forEach((property, i) => {
    if (ahsData[property]) {
      description += `${ahsData[property]}`;
      if (i !== descriptionProperties.length - 1) {
        description += ", ";
      } else {
        description += ".";
      }
    }
  });
  return description;
}

const StyledButton = styled(Button)`
  padding: 0 var(--size-1);
`;

const StyledDetails = styled.details`
  width: 100%;
`;
const ColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1rem;
`;
const NoWrap = styled.span`
  white-space: nowrap;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  align-self: flex-start;
  position: relative;
  z-index: 0;
  thead {
    tr {
      vertical-align: bottom;
    }
    th {
      padding: var(--size-2);
      text-align: left;
      min-width: 150px;
    }
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--surface-1);
    ${above.sm`
      th:first-child {
        position: -webkit-sticky;
        position: sticky;
        left: 0;
        z-index: 2;
        background: var(--surface-1);
      }
    `}
  }
  tbody {
    position: relative;
    z-index: 0;
    td {
      padding: 0 var(--size-2);
      min-width: max-content;
    }
    tr {
      cursor: pointer;
      ${above.sm`
        td:first-child {
          position: -webkit-sticky;
          position: sticky;
          left: 0;
          z-index: 1;
          background: var(--surface-1);
        }
      `}
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
