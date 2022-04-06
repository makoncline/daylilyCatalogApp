import React from "react";

export const ListTable = (props: any) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.userLists.map((list: any) => (
          <tr key={list.id} onClick={props.handleEdit(list)}>
            <td>{list.name}</td>
            <td>{list.intro}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
