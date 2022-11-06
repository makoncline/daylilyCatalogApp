import React from "react";
function Test() {
  return (
    <button
      onClick={() => {
        throw new Error("test error");
      }}
    >
      throw error
    </button>
  );
}

export default Test;
