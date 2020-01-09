import React from "react";
import { Table, Avatar, Button } from "antd";
// import SearchColumn from "../components/SearchColumn";
import Highlighter from "react-highlight-words";
const { Column } = Table;

export default function LiliesTable(props: any) {
  return (
    <Table
      dataSource={props.dataSource}
      rowKey={(record: any) => record.id}
      onRow={(record: any) => {
        return {
          onClick: () => props.handleEdit(record), // click row
        };
      }}
    >
      <Column
        title="Img"
        dataIndex="imgUrl"
        key="imgUrl"
        render={(imgUrl: any) => (
          <div>
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
        title="Name"
        dataIndex="name"
        key="name"
        render={(text: any) => (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[props.searchText]}
            autoEscape
            textToHighlight={text.toString()}
          />
        )}
      />
      <Column title="Price" dataIndex="price" key="price" />
      <Column title="Public Note" dataIndex="publicNote" key="publicNote" />
      <Column title="Private Note" dataIndex="privateNote" key="privateNote" />
      <Column
        title="Data"
        dataIndex="ahsId"
        key="ahsId"
        render={(ahsId: any) => (
          <div>
            {ahsId && (
              <Button onClick={e => e.stopPropagation()}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`http://www.daylilydatabase.org/detail.php?id=${ahsId}`}
                >
                  Data
                </a>
              </Button>
            )}
          </div>
        )}
      />
    </Table>
  );
}
