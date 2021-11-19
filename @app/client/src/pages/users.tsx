import { NextLayout, UserCard } from "@app/components";
import { useUsersQuery } from "@app/graphql";
import React from "react";

//react component that displays a card for each user from the Users graphql query
const Users = () => {
  const { data, loading, error } = useUsersQuery();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  const users = data?.users?.nodes;
  return (
    <NextLayout>
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
    </NextLayout>
  );
};

export default Users;
