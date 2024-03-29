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
      {data?.currentUser?.lists.nodes.length ? (
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
      ) : (
        <p>No lists found. Create a list to get started.</p>
      )}
    </>
  );
};

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead {
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
`;
