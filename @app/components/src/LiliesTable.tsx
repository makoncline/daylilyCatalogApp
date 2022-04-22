// @ts-nocheck
import { Button, Thumbnail, thumbnailProps } from "@app/design";
import { Table } from "antd";
import Image from "next/image";
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
        type="primary"
      />
    )}
  </div>
);

export function LiliesTable(props: any) {
  // const height = useWindowSize()[1];
  const dataSource = props.dataSource.map((item) => {
    if (item.imgUrl?.length) {
      return { ...item, avatar: [item.imgUrl[0]] };
    }
    if (item.ahsDatumByAhsRef?.image) {
      return {
        ...item,
        avatar: [item.ahsDatumByAhsRef.image],
      };
    }
    return {
      ...item,
      avatar: [],
    };
  });

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

  const filters = Array.from(
    new Set(dataSource.map((item) => item && item.list && item.list.name))
  ).map((item) => {
    return { value: item, text: item };
  });

  return (
    <Table
      dataSource={dataSource}
      pagination={{
        position: ["topRight", "bottomRight"],
        defaultPageSize: 25,
        hideOnSinglePage: true,
        pageSizeOptions: ["10", "25", "50", "100"],
      }}
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
        dataIndex="avatar"
        key="avatar"
        width={72}
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) => a.imgUrl.length - b.imgUrl.length}
        render={(avatar: any) => (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {avatar && avatar.length ? (
              <Thumbnail>
                <Image src={avatar[0]} {...thumbnailProps} />
              </Thumbnail>
            ) : (
              <Thumbnail>
                <Image src={"/flowerPlaceholder.png"} {...thumbnailProps} />
              </Thumbnail>
            )}
          </div>
        )}
      />
      <Column
        title="List"
        dataIndex="list"
        key="list"
        width={125}
        render={(list) => (list ? truncate(list.name, 40) : "")}
        // sortDirections={["descend", "ascend"]}
        // sorter={(a: any, b: any, order: any) => {
        //   if (order === "ascend") {
        //     if (a.list === b.list) {
        //       return 0;
        //     } else if (a.list === null) {
        //       return 1;
        //     } else if (b.list === null) {
        //       return -1;
        //     } else {
        //       return sortAlphaNum(a.list.name, b.list.name) > 0 ? -1 : 1;
        //     }
        //   } else if (order === "descend") {
        //     if (a.list === b.list) {
        //       return 0;
        //     } else if (a.list === null) {
        //       return -1;
        //     } else if (b.list === null) {
        //       return 1;
        //     } else {
        //       return sortAlphaNum(a.list.name, b.list.name) > 0 ? -1 : 1;
        //     }
        //   }
        // }}
        filters={filters}
        onFilter={(value, record) => {
          if (!value) {
            return !record.list;
          } else {
            return record.list && record.list.name
              ? value == record.list.name
              : false;
          }
        }}
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
