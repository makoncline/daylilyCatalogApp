import { Button, Center, Spinner } from "@app/design";
import { useListsQuery } from "@app/graphql";
import { createListUrl, toEditListUrl } from "@app/lib";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

export const Lists = () => {
  const { data } = useListsQuery();
  const user = data && data.currentUser;
  if (!user)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  return (
    <>
      <Link href={createListUrl} passHref>
        <Button block>Create List</Button>
      </Link>
      <StyledTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.currentUser?.lists.nodes.map((list) => (
            <tr key={list.id}>
              <td>{list.name}</td>
              <td>{list.intro}</td>
              <td>
                <Link href={toEditListUrl(list.id)}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </>
  );
};

const StyledTable = styled.table`
  width: 100%;
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
    border-bottom: var(--hairline);
  }
  th {
    padding: var(--size-2);
    text-align: left;
  }
  td {
    padding: var(--size-2);
    &:first-child {
      white-space: nowrap;
    }
  }
  tbody tr {
    cursor: pointer;
  }
  tbody tr:hover {
    background: var(--surface-2);
  }
`;
