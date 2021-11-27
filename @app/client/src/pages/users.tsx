import { NextLayout, UserCard } from "@app/components";
import { FancyHeading } from "@app/design";
import { useUsersQuery } from "@app/graphql";
import React from "react";
import styled from "styled-components";

//react component that displays a card for each user from the Users graphql query
const Users = () => {
  const { data, loading, error } = useUsersQuery();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  const users = data?.users?.nodes;
  return (
    <NextLayout>
      <HeadingWrapper>
        <FancyHeading level={1}>Users</FancyHeading>
        <p>The place to view users catalogs.</p>
      </HeadingWrapper>
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
const HeadingWrapper = styled.div`
  text-align: center;
`;
const UsersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;
