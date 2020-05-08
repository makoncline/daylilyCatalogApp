// @ts-nocheck
import { InfoOutlined } from "@ant-design/icons";
import { Avatar, Button, Table } from "antd";
import React from "react";
import Highlighter from "react-highlight-words";
// import useWindowSize from "../hooks/useWindowSize";
const { Column } = Table;

const DataButton = (ahsId: any) => (
  <div
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
    }}
  >
    {ahsId && (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          // @ts-ignore
          window.open(
            `http://www.daylilydatabase.org/detail.php?id=${ahsId}`,
            "_blank"
          );
        }}
        shape="circle"
        icon={<InfoOutlined />}
        type="primary"
      />
    )}
  </div>
);

export function LiliesTable(props: any) {
  // const height = useWindowSize()[1];
  const truncate = (input: string, length: number) =>
    input && input.length > length
      ? `${input.substring(0, length - 3)}...`
      : input;
  const currency = (input: Number) =>
    new Number(input).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
      useGrouping: true,
    });

  const sortAlphaNum = (a, b) =>
    ("" + a).localeCompare(b + "", "en", { numeric: true });
  return (
    <Table
      dataSource={props.dataSource}
      pagination={{ pageSize: 50 }}
      bordered
      scroll={{ x: 876 }}
      size="middle"
      rowKey={(record: any) => record.id}
      onRow={(record: any) => {
        return {
          onClick: () => props.handleEdit(record), // click row
        };
      }}
      style={{ background: "white" }}
    >
      <Column
        title="Name"
        dataIndex="name"
        key="name"
        width={235}
        defaultSortOrder="descend"
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) =>
          sortAlphaNum(a.name, b.name) >= 0 ? -1 : 1
        }
        render={(text: any) => (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[props.searchText]}
            autoEscape
            textToHighlight={truncate(text, 30).toString()}
          />
        )}
      />
      <Column
        title="📷"
        dataIndex="imgUrl"
        key="imgUrl"
        width={72}
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) => a.imgUrl.length - b.imgUrl.length}
        render={(imgUrl: any) => (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {imgUrl && imgUrl.length ? (
              <Avatar
                size="large"
                src={imgUrl[Math.floor(Math.random() * imgUrl.length)]}
              />
            ) : (
              <Avatar size="large" src={"https://i.imgur.com/0cGzAR8.png"} />
            )}
          </div>
        )}
      />
      <Column
        title="Price"
        dataIndex="price"
        key="price"
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) =>
          sortAlphaNum(a.price, b.price) >= 0 ? -1 : 1
        }
        render={(price) => price && `${currency(price)}`}
        width={104}
      />
      <Column
        title="Public Note"
        dataIndex="publicNote"
        key="publicNote"
        render={(note) => truncate(note, 140)}
      />
      <Column
        title="Private Note"
        dataIndex="privateNote"
        key="privateNote"
        render={(note) => truncate(note, 140)}
      />
      <Column
        title="Data"
        dataIndex="ahsId"
        key="ahsId"
        width={72}
        render={DataButton}
      />
    </Table>
  );
}
