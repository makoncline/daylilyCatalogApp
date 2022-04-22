/* eslint-disable react/jsx-key */
import { Thumbnail } from "@app/design";
import { LilyDataFragment, Maybe } from "@app/graphql";
import { toViewListingUrl } from "@app/lib";
import Image from "next/image";
import router from "next/router";
import React from "react";
import type { Column } from "react-table";
import { useFilters, useGlobalFilter, useTable } from "react-table";

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
        columns: [
          {
            accessor: "name",
          },
        ],
      },
      {
        Header: "Image",
        columns: [
          {
            accessor: "imgUrl",
            // eslint-disable-next-line react/display-name
            Cell: ({ value }) => (
              <Thumbnail>
                <Image
                  src={value.length > 0 ? value[0] : "/flowerPlaceholder.png"}
                />
              </Thumbnail>
            ),
          },
        ],
      },
      {
        Header: "Price",
        columns: [
          {
            accessor: "price",
            Cell: ({ value }) => value > 0 && currency(value),
          },
        ],
      },
      {
        Header: "Public note",
        columns: [
          {
            accessor: "publicNote",
            Cell: ({ value }) => truncate(value || ""),
          },
        ],
      },
      {
        Header: "Private note",
        columns: [
          {
            accessor: "privateNote",
            Cell: ({ value }) => truncate(value || ""),
          },
        ],
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter
  );

  return tableInstance;
};

export function LiliesTable({
  dataSource,
}: {
  dataSource: LilyDataFragment[];
}) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useReactTable({
      rawData: dataSource,
    });

  function handleClick(id: number) {
    const url = toViewListingUrl(id);
    console.log(url);
    router.push(`${url}`);
  }
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
    </table>
  );
}

const truncate = (input: string, length: number = 100) =>
  input && input.length > length
    ? `${input.substring(0, length - 3)}...`
    : input;

const currency = (input: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(input);
