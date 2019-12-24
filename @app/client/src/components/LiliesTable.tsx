import React, { useState } from "react";
import { Table, Avatar, Typography, Button, Input, Icon } from "antd";
import Highlighter from "react-highlight-words";
import Link from "next/link";
const { Paragraph, Text } = Typography;

export default function LiliesTable(props: any) {
  const editAction = (record: any) => (
    <Button
      onClick={() => props.handleEdit(record)}
      data-cy="settingslilies-button-edit"
      block
    >
      Edit
    </Button>
  );

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  let searchInput: any = null;

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex: any) => ({
    // eslint-disable-next-line react/display-name
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: any;
      selectedKeys: any;
      confirm: any;
      clearFilters: any;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),

    // eslint-disable-next-line react/display-name
    filterIcon: (filtered: any) => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
    // eslint-disable-next-line react/display-name
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Img",
      dataIndex: "imgUrl",
      key: "imgUrl",
      width: "25%",
      // eslint-disable-next-line react/display-name
      render: (imgUrl: any) => (
        <div>
          {imgUrl ? (
            <Avatar size="large" src={imgUrl} />
          ) : (
            <Avatar size="large" src={"https://i.imgur.com/0cGzAR8.png"} />
          )}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "50%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      width: "25%",
      // eslint-disable-next-line react/display-name
      render: (record: any) => editAction(record),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={props.dataSource}
      rowKey={(record: any) => record.id}
      expandedRowRender={(record: any) => {
        return (
          <div>
            {record.imgUrl && (
              <img
                alt={`${record.name} image`}
                src={record.imgUrl}
                style={{ maxWidth: "300px", width: "50vw" }}
              />
            )}
            {record.ahsId && (
              <div>
                <Text type="secondary" style={{ fontSize: ".75rem" }}>
                  Data:
                </Text>
                <Paragraph
                  style={{
                    margin: "0",
                    marginLeft: "1rem",
                    padding: "0",
                  }}
                >
                  <Link
                    href={`http://www.daylilydatabase.org/detail.php?id=${record.ahsId}`}
                  >
                    <a>View AHS data</a>
                  </Link>
                </Paragraph>
              </div>
            )}
            {record.price && (
              <div>
                <Text type="secondary" style={{ fontSize: ".75rem" }}>
                  Price:
                </Text>
                <Paragraph
                  style={{
                    margin: "0",
                    marginLeft: "1rem",
                    padding: "0",
                  }}
                >
                  {`$ ${record.price}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") ||
                    ""}
                </Paragraph>
              </div>
            )}
            {record.publicNote && (
              <div>
                <Text type="secondary" style={{ fontSize: ".75rem" }}>
                  Pubilc note:
                </Text>
                <Paragraph
                  style={{
                    margin: "0",
                    marginLeft: "1rem",
                    padding: "0",
                  }}
                >
                  {record.publicNote || ""}
                </Paragraph>
              </div>
            )}
            {record.privateNote && (
              <div>
                <Text type="secondary" style={{ fontSize: ".75rem" }}>
                  Private note:
                </Text>
                <Paragraph
                  style={{
                    margin: "0",
                    marginLeft: "1rem",
                    padding: "0",
                  }}
                >
                  {record.privateNote || ""}
                </Paragraph>
              </div>
            )}
            <div>
              <Text type="secondary" style={{ fontSize: ".75rem" }}>
                Created at:
              </Text>
              <Paragraph
                style={{
                  margin: "0",
                  marginLeft: "1rem",
                  padding: "0",
                }}
              >
                {new Date(Date.parse(record.createdAt)).toLocaleString()}
              </Paragraph>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: ".75rem" }}>
                Updated at:
              </Text>
              <Paragraph
                style={{
                  margin: "0",
                  marginLeft: "1rem",
                  padding: "0",
                }}
              >
                {new Date(Date.parse(record.updatedAt)).toLocaleString()}
              </Paragraph>
            </div>
          </div>
        );
      }}
    />
  );
}
