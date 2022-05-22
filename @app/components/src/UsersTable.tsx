import { getPlaceholderImageUrl, Space } from "@app/design";
import { UserDataFragment, UsersQuery } from "@app/graphql";
import React from "react";
import {
  Column,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";

import { Pagination } from "./Pagination";
import { GlobalFilter } from "./TableFilters";
import { UserCard } from "./UserCard";

function UsersTable({ data }: { data: UsersQuery }) {
  const users = data.users?.nodes || [];
  const {
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useReactTable({
    rawData: users,
  });
  return (
    <>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
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
      <Space direction="column">
        {page.map((row) => {
          prepareRow(row);
          const {
            id,
            username,
            intro,
            userLocation,
            avatarUrl,
            lilies: { totalCount },
          } = row.original;
          return (
            <UserCard
              key={`${id}`}
              id={id}
              username={username || "No name"}
              intro={intro}
              location={userLocation}
              image={avatarUrl || getPlaceholderImageUrl(username)}
              numListings={totalCount}
            />
          );
        })}
      </Space>
    </>
  );
}
export { UsersTable };

const useReactTable = ({ rawData }: { rawData: UserDataFragment[] }) => {
  const data = React.useMemo(() => {
    const sortByLastUpdated = (a: UserDataFragment, b: UserDataFragment) =>
      new Date(a.updatedAt) > new Date(b.updatedAt) ? -1 : 1;
    const sortByNumListings = (a: UserDataFragment, b: UserDataFragment) =>
      b.lilies.totalCount - a.lilies.totalCount;
    const paidUsers = rawData
      .filter(
        (u) => u.stripeSubscription?.subscriptionInfo?.status === "active"
      )
      .sort(sortByLastUpdated);
    const freeUsers = rawData // will not display free users once ther are enough paid
      .filter(
        (u) => u.stripeSubscription?.subscriptionInfo?.status !== "active"
      )
      .sort(sortByNumListings);
    return [...paidUsers, ...freeUsers];
  }, [rawData]);
  const columns: Column<UserDataFragment>[] = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Username",
        accessor: "username",
      },
      {
        Header: "Intro",
        accessor: "intro",
      },
      {
        Header: "Avatar Url",
        accessor: "avatarUrl",
      },
      {
        Header: "Updated at",
        accessor: "updatedAt",
      },
      {
        Header: "User location",
        accessor: "userLocation",
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return tableInstance;
};
