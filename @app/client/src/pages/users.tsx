// @ts-nocheck
import { NextLayout, UserCard } from "@app/components";
import { FancyHeading } from "@app/design";
import { useUsersQuery } from "@app/graphql";
import React from "react";
import { useFilters, useGlobalFilter, useTable } from "react-table";
import styled from "styled-components";

const useReactTable = ({ rawData }) => {
  const data = React.useMemo(
    () =>
      rawData.map((u) => ({
        ...u,
        status: u.stripeSubscription?.subscriptionInfo?.status,
      })),
    [rawData]
  );

  const columns = React.useMemo(
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
      {
        Header: "Status",
        accessor: "status",
      },
    ],
    []
  );

  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
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
    useGlobalFilter
  );
  const { headerGroups, rows, prepareRow } = tableInstance;
  const headers = headerGroups[0].headers;
  const values = rows.map((r) => {
    prepareRow(r);
    return r.values;
  });

  return { headers, values };
};

const Users = () => {
  const { data, loading, error } = useUsersQuery();

  const { headers, values: users } = useReactTable({
    rawData: data?.users?.nodes || [],
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <NextLayout>
      <HeadingWrapper>
        <FancyHeading level={1}>Users</FancyHeading>
        <p>The place to view users catalogs.</p>
      </HeadingWrapper>
      <FilterWrapper>
        {headers.map((header) => (
          <label key={header.id}>
            {header.render("Header")}
            {header.render("Filter")}
          </label>
        ))}
      </FilterWrapper>
      <UsersWrapper>
        {users &&
          users.map((user) => (
            <UserCard
              key={user.id}
              image={user.avatarUrl}
              name={user.username}
              location={user.userLocation}
              intro={user.intro}
            />
          ))}
      </UsersWrapper>
    </NextLayout>
  );
};

export default Users;

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
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

const HeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const UsersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
`;
const FilterWrapper = styled.div``;
