import React, { useEffect, useState } from "react";
import { Table, Avatar, Button } from "antd";
// import SearchColumn from "../components/SearchColumn";
import Highlighter from "react-highlight-words";
const { Column } = Table;

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export default function LiliesTable(props: any) {
  const height = useWindowSize()[1];
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
  return (
    <Table
      dataSource={props.dataSource}
      pagination={{ pageSize: 50 }}
      bordered
      scroll={{ x: 876, y: height - 286 }}
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
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) =>
          a.name === [a.name, b.name].sort()[0] ? 1 : -1
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
          <>
            {imgUrl && imgUrl.length ? (
              <Avatar
                size="large"
                src={imgUrl[Math.floor(Math.random() * imgUrl.length)]}
              />
            ) : (
              <Avatar size="large" src={"https://i.imgur.com/0cGzAR8.png"} />
            )}
          </>
        )}
      />
      <Column
        title="Price"
        dataIndex="price"
        key="price"
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) => a.price - b.price}
        render={price => price && `${currency(price)}`}
        width={104}
      />
      <Column
        title="Public Note"
        dataIndex="publicNote"
        key="publicNote"
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) =>
          (a.publicNote || "").length - (b.publicNote || "").length
        }
        render={note => truncate(note, 140)}
      />
      <Column
        title="Private Note"
        dataIndex="privateNote"
        key="privateNote"
        sortDirections={["descend", "ascend"]}
        sorter={(a: any, b: any) =>
          (a.privateNote || "").length - (b.privateNote || "").length
        }
        render={note => truncate(note, 140)}
      />
      <Column
        title="Data"
        dataIndex="ahsId"
        key="ahsId"
        width={72}
        render={(ahsId: any) => (
          <div>
            {ahsId && (
              <Button
                onClick={e => {
                  e.stopPropagation();
                  window.open(
                    `http://www.daylilydatabase.org/detail.php?id=${ahsId}`,
                    "_blank"
                  );
                }}
                shape="circle"
                icon="info"
                type="primary"
              />
            )}
          </div>
        )}
      />
    </Table>
  );
}
