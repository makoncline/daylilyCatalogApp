import { Button, Space } from "@app/design";
import React from "react";

function Pagination({
  canPreviousPage,
  canNextPage,
  pageOptions,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize,
  pageIndex,
  pageSize,
}: any) {
  return (
    <Space
      block
      responsive
      style={{ alignItems: "center", justifyContent: "flex-end" }}
    >
      <Space center>
        <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </Button>{" "}
        <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </Button>{" "}
        <Button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </Button>{" "}
        <Button
          onClick={() => gotoPage(pageOptions.length - 1)}
          disabled={!canNextPage}
        >
          {">>"}
        </Button>{" "}
      </Space>
      <Space center>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onKeyDown={handleEnter}
            onBlur={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
      </Space>
      <Space center>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </Space>
    </Space>
  );
}

export { Pagination };

const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key.toLowerCase() === "enter") {
    event.currentTarget.blur();
  }
};
