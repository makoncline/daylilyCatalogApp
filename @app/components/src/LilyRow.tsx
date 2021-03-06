// @ts-nocheck
import { useDeleteLilyMutation } from "@app/graphql";
import { Avatar, List, Typography } from "antd";
import React from "react";

const { Title, Paragraph, Text } = Typography;

export const LilyRow = (props: any) => {
  const [deleteLily] = useDeleteLilyMutation();
  const lily = props.lily;
  const handleEdit = props.handleEdit;
  const deleteAction = () => (
    <a
      onClick={() => deleteLily({ variables: { id: lily.id } })}
      data-cy="settingslilies-button-delete"
    >
      Delete
    </a>
  );
  const editAction = () => (
    <a onClick={() => handleEdit(lily)} data-cy="settingslilies-button-edit">
      Edit
    </a>
  );

  return (
    <List.Item
      data-cy={`settingslilies-liiyitem-${lily.id}`}
      key={lily.id}
      actions={[deleteAction(), editAction()]}
    >
      <List.Item.Meta
        avatar={
          lily.imgUrl ? (
            <Avatar size="large" src={lily.imgUrl[0]} />
          ) : (
            <Avatar size="large" src={"/flowerPlaceholder.png"} />
          )
        }
        title={
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "baseline",
                margin: "0",
                padding: "0",
              }}
            >
              <Title
                level={3}
                style={{ margin: "0", padding: "0", marginRight: "1rem" }}
              >
                {lily.name}
              </Title>
              <Text type="secondary" style={{ margin: "0", padding: "0" }}>
                {lily.price ? ` - $${lily.price}` : " - Display only"}
              </Text>
            </div>
            {lily.publicNote && (
              <div>
                <Text type="secondary" style={{ fontSize: ".75rem" }}>
                  Pubilc note:
                </Text>
                <Paragraph
                  style={{ margin: "0", marginLeft: "1rem", padding: "0" }}
                >
                  {lily.publicNote || ""}
                </Paragraph>
              </div>
            )}
            {lily.privateNote && (
              <div>
                <Text type="secondary" style={{ fontSize: ".75rem" }}>
                  Private note:
                </Text>
                <Paragraph
                  style={{ margin: "0", marginLeft: "1rem", padding: "0" }}
                >
                  {lily.privateNote || ""}
                </Paragraph>
              </div>
            )}
          </div>
        }
        description={`Added ${new Date(
          Date.parse(lily.createdAt)
        ).toLocaleString()}`}
      />
    </List.Item>
  );
};
