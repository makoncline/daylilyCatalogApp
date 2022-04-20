import { Button } from "@app/design";
import { useListsQuery } from "@app/graphql";
import Link from "next/link";
import Router from "next/router";
import React from "react";

export const Lists = () => {
  const { data } = useListsQuery();
  const user = data && data.currentUser;
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <Link href="/lists/create" passHref>
        <Button>Create List</Button>
      </Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {data?.currentUser?.lists.nodes.map((list) => (
            <tr
              key={list.id}
              onClick={() => Router.push(`lists/edit/${list.id}`)}
            >
              <td>{list.name}</td>
              <td>{list.intro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
