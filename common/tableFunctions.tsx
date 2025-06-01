import React from "react";

export const customStyles = {
  headRow: {
    style: {
      background: "var(--dgreen) !important",
      color: "#D9D9D9",
      borderRadius: "0.25rem 0.25rem 0 0",
    },
  },
  rows: {
    style: {
      fontSize: "10px",
      "&:last-of-type": {
        borderRadius: "0 0 0.25rem 0.25rem",
        borderBottom: "2px solid #0000001f ",
      },
    },
  },
};

export const customSearchStyles = {
  table: {
    style: {
      "& .rdt_TableBody": {
        height: "100px",
        overflow: "auto",
      },
    },
  },
  headRow: {
    style: {
      background: "var(--bg) !important",
      color: "var(--color-light) !important",
      borderRadius: "0.25rem 0.25rem 0 0",
      height: "30px",
      minHeight: "30px",
    },
  },
  rows: {
    style: {
      fontSize: "10px",
      height: "30px",
      minHeight: "30px",
      "&:last-of-type": {
        borderRadius: "0 0 0.25rem 0.25rem",
        borderBottom: "2px solid #0000001f ",
      },
    },
  },
};

export const statusCol = (row) => (
  <span
    title={row.status}
    className={
      "text-nowrap rounded-1 f-10 f-i p-2 py-1" +
      (row.status === "Active"
        ? " clr-lgreen bg-lgreen"
        : row.status === "Inactive"
        ? " clr-danger bg-danger "
        : " clr-orange bg-orange ")
    }
    style={{ lineHeight: "18px" }}
  >
    &#x2022; {row.status}
  </span>
);

export const sortFunction = (rA, rB, key) =>
  rA[key] || "" > rB[key] || "" ? 1 : rB[key] || "" > rA[key] || "" ? -1 : 0;
