import { Table } from "antd";
import React from "react";

export const ListTable = (props: any) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    { title: "Description", dataIndex: "intro" },
  ];
  return (
    <Table
      dataSource={props.userLists}
      pagination={{
        hideOnSinglePage: true,
      }}
      columns={columns}
      rowKey={(record: any) => record.id}
      onRow={(record: any) => {
        return {
          onClick: () => props.handleEdit(record), // click row
        };
      }}
    />
  );
};
