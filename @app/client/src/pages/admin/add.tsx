import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { Button, Center, Space, Spinner } from "@app/design";
import {
  AhsDataFragment,
  useAhsDataIdsQuery,
  useAhsDatumByIdQuery,
  useCreateAhsDatumMutation,
  useSharedQuery,
} from "@app/graphql";
import { NextPage } from "next";
import React from "react";
import styled from "styled-components";

type ImportData = Omit<
  AhsDataFragment,
  "__typename" | "id" | "ahsId" | "createdAt" | " updatedAt"
> & { ahsId: string };

const Add: NextPage = () => {
  const [data, setData] = React.useState<ImportData[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const sharedQuery = useSharedQuery();
  const ahsDataIdsQuery = useAhsDataIdsQuery();
  const [createAhsDatum] = useCreateAhsDatumMutation();
  const [lastAdded, setLastAdded] = React.useState<ImportData | null>(null);
  const {
    data: lastAddedData,
    loading: lastAddedLoading,
    error: lastAddedError,
  } = useAhsDatumByIdQuery({
    variables: { ahsId: lastAdded ? parseInt(lastAdded?.ahsId!) : 0 },
  });
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = sharedQuery;
  const { data: ahsDataIdsQueryData, refetch: ahsDataIdsQueryRefetch } =
    ahsDataIdsQuery;
  const ahsDataIds = ahsDataIdsQueryData?.ahsData?.nodes.map(
    (node) => node.ahsId
  );
  const numAhsIds = ahsDataIds?.length || 0;
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
  const newData = data.filter(
    (d) => d.ahsId && !ahsDataIds?.includes(parseInt(d.ahsId))
  );

  const newDataSlice = newData.slice(0, 10);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProcessing(true);
    // get data from file
    if (e.target.files) {
      const file = e.target.files![0];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        console.log("start on load");
        const rawData = reader.result;
        if (typeof rawData === "string") {
          const jsonData = tsvToJson(rawData);
          setData(jsonData);
          setProcessing(false);
        }
        console.log("end on load");
      };
    }
  };

  const handleAdd = async (newData: ImportData) => {
    console.log("start adding");
    setProcessing(true);
    createAhsDatum({
      variables: {
        input: { ahsDatum: { ...newData, ahsId: parseInt(newData.ahsId) } },
      },
    })
      .then((res) => {
        const d = data.filter((d) => d.ahsId !== newData.ahsId);
        setData(d);
        setLastAdded(newData);
        console.log("input", newData);
        console.log("added", res.data?.createAhsDatum?.ahsDatum);
        setProcessing(false);
        console.log("done adding");
      })
      .catch((e) => {
        console.log(`error adding new ahs data ${JSON.stringify(newData)}`, e);
        setProcessing(false);
        console.log("done adding");
      });
  };

  return (
    <SharedLayout title="Add AHS Data" query={sharedQuery}>
      {sharedQueryData?.currentUser?.isAdmin ? (
        <Space direction="column">
          <Space>
            <p># ahsIds: {numAhsIds.toLocaleString()}</p>
            <Button
              onClick={async () => {
                setProcessing(true);
                try {
                  ahsDataIdsQueryRefetch();
                } catch (e) {
                  console.log("error refetching ahsIds", e);
                }
                setProcessing(false);
              }}
            >
              Refetch ahsIds
            </Button>
          </Space>
          <input type="file" onChange={handleInputChange} />
          {lastAdded ? (
            <>
              Last added
              <StyledTable>
                <thead>
                  <tr>
                    <th>source</th>
                    {["id", ...headers, "createdAt", "updatedAt"].map(
                      (header, i) => (
                        <th key={i}>{header}</th>
                      )
                    )}
                  </tr>
                </thead>
                {lastAddedLoading ? (
                  <Center>
                    <Spinner />
                  </Center>
                ) : (
                  <tbody>
                    {lastAddedData?.ahsData?.nodes.map((node) => (
                      <>
                        <tr key={1}>
                          <td>database</td>
                          {["id", ...headers, "createdAt", "updatedAt"].map(
                            (field, i) => (
                              <td key={i}>{node[field]}</td>
                            )
                          )}
                        </tr>
                        <tr key={2}>
                          <td>input</td>
                          {["id", ...headers, "createdAt", "updatedAt"].map(
                            (field, i) => (
                              <td key={i}>{lastAdded[field]}</td>
                            )
                          )}
                        </tr>
                      </>
                    ))}
                  </tbody>
                )}
              </StyledTable>
            </>
          ) : null}
          {processing ? (
            <Center>
              <Spinner />
            </Center>
          ) : (
            <>
              <p># new items: {newData.length.toLocaleString()}</p>
              {data.length > 0 && (
                <StyledTable>
                  <thead>
                    <tr>
                      <th>add</th>
                      {headers.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {newDataSlice.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <Button onClick={() => handleAdd(d)}>Add</Button>
                        </td>
                        {Object.values(d).map((v, i) => (
                          <td key={i}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </StyledTable>
              )}
            </>
          )}
        </Space>
      ) : sharedQueryLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : sharedQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`/`} />
      )}
    </SharedLayout>
  );
};

export default Add;

// not type safe
function tsvToJson(tsv: string) {
  console.log("start tsv");
  const lines = tsv.split("\n");
  const headers = lines[0].split("\t");
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split("\t");
    for (let j = 0; j < headers.length; j++) {
      const header = snakeToCamel(headers[j]);
      obj[header] = currentline[j];
    }
    result.push(obj);
  }
  console.log("end tsv");
  return result as ImportData[];
}

const snakeToCamel = (str: string) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

const StyledTable = styled.table`
  border-collapse: collapse;
  white-space: nowrap;
  th,
  td {
    border: var(--hairline);
    padding: var(--size-2);
    text-align: start;
  }
`;
