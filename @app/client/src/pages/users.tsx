import { NextLayout } from "@app/components";
import { Card } from "@app/design";
import { useUsersQuery } from "@app/graphql";
import Image from "next/image";
import React from "react";

//react component that displays a card for each user from the Users graphql query
const User = () => {
  const { data, loading, error } = useUsersQuery();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  const users = data?.users?.nodes;
  return (
    <NextLayout>
      {users &&
        users.map((user) => (
          <Card key={user.id}>
            {user.avatarUrl && (
              <Card.Image>
                <Image
                  src={user.avatarUrl}
                  alt="user avatar"
                  width={200}
                  height={200}
                  objectFit="cover"
                />
              </Card.Image>
            )}
            <div className="card-body">
              <h5 className="card-title">{user.name}</h5>
              <p className="card-text">{user.userLocation}</p>
              <p className="card-text">{user.intro}</p>
            </div>
          </Card>
        ))}
    </NextLayout>
  );
};

export default User;
