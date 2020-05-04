import React, { useState } from "react";
import { Table, Button, Input, Icon } from "antd";
import Highlighter from "react-highlight-words";
const { Column } = Table;

export default function SearchColumn(props: any) {
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

  const getColumnSearchProps = (dataIndex: any) => {
    const filterDropdown = ({
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
            setSelectedKeys(
              // @ts-ignore
              e.currentTarget.value
                ? // @ts-ignore
                  // @ts-ignore
                  [e.currentTarget.value]
                : []
            )
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
    );

    const filterIcon = (filtered: any) => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    );

    const onFilter = (value: any, record: any) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());

    const onFilterDropdownVisibleChange = (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.select(), 10);
      }
    };

    const render = (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      );
    return {
      filterDropdown,
      filterIcon,
      onFilter,
      onFilterDropdownVisibleChange,
      render,
    };
  };
  return (
    <Column
      title={props.title}
      dataIndex={props.dataIndex}
      key={props.key}
      {...getColumnSearchProps(props.dataIndex)}
    />
  );
}
