import { List, useListsQuery } from "@app/graphql";
import { Button } from "antd";
import React, { useState } from "react";

import { ListTable } from "./";
import { AddListForm } from "./AddListForm";

export const Lists = () => {
  const [showAddListForm, setShowAddListForm] = useState<boolean>(false);
  const [updateList, setUpdateList] = useState<List | null>(null);

  const { data } = useListsQuery();
  const user = data && data.currentUser;

  if (!user) return <p>Loading...</p>;

  const addListProps = {
    show: showAddListForm,
    setShow: setShowAddListForm,
    updateList: updateList,
    setUpdateList: setUpdateList,
  };
  function handleEdit(list: List) {
    setUpdateList(null);
    setUpdateList(list);
    setShowAddListForm(true);
  }
  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setUpdateList(null);
          setShowAddListForm(true);
        }}
        data-cy="settingslilies-button-addlily"
        block
        style={{
          marginLeft: "auto",
          marginBottom: "1rem",
          display: "block",
        }}
      >
        Add list
      </Button>
      <ListTable userLists={user.lists.nodes} handleEdit={handleEdit} />
      <AddListForm {...addListProps} />
    </div>
  );
};
