import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

import Layout from "layout";
import { customStyles, sortFunction } from "@/common/tableFunctions";
import DashboardCards from "@/components/card/DashboardCards";
import FilesPopover from "@/components/popover/FIlesPopover";

import { useDebounce } from "@/hooks/useDebounce";

import FileService from "@/services/file.service";
import { dateFormat } from "@/common/functions";
import { Spinner } from "@/components/loaders/Spinner";

const fileService = new FileService();

export default function Dashboard({ user, mutate, router }) {
  const { isReady } = router;
  const defaultData = { rst: false, ld: false, data: [], count: 0, pg: 1, pPg: 5 };
  const [dt, setDt] = useState<any>({ ...defaultData, ld: true });
  const [search, setSearch] = useState("");

  const err = (e) => {
    toast.error(e || "Error");
    setDt({ ...defaultData });
    mutate();
  };
  const debounceSearch = useDebounce(search, 500);
  useEffect(() => {
    const getFiles = async () => {
      try {
        const files: any = await fileService.getFiles(1, dt.pPg, debounceSearch);
        setDt({ ...dt, ...files, rst: false, ld: false, pg: 1 });
      } catch (e) {
        err(e);
      }
    };

    if (user && isReady) getFiles();
  }, [user, isReady, debounceSearch]);

  const handlePageChange = async (pg: any) => {
    if (!dt.rst) {
      try {
        const clients: any = await fileService.getFiles(pg, dt.pPg, debounceSearch);
        setDt({ ...dt, ...clients, ld: false, pg });
      } catch (e) {
        err(e);
      }
    }
  };

  const handlePerRowsChange = async (pPg: any, pg: any) => {
    try {
      const clients: any = await fileService.getFiles(pg, pPg, debounceSearch);
      setDt({ ...dt, ...clients, ld: false, pg, pPg });
    } catch (e) {
      err(e);
    }
  };

  const onDelete = async (row) => {
    try {
      await fileService.deleteFile(row.id);
      await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
    }
  };

  const myFilesColumns: any = [
    {
      name: "File Name",
      selector: (row) => <span title={row.fileName}>{row.fileName}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "fileName"),
      minWidth: "150px",
      grow: 1,
    },
    {
      name: "Start Date",
      selector: (row) => <span title={dateFormat(row.createdAt)}>{dateFormat(row.createdAt)}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "createdAt"),
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Status",
      selector: (row) => (
        <span
          className={
            "text-nowrap rounded-1 f-10 f-i p-2 py-1" +
            (row.status.includes("Successful")
              ? " clr-lgreen bg-lgreen"
              : row.status.includes("Failed")
              ? " clr-danger bg-danger "
              : " clr-orange bg-orange ")
          }
          style={{ lineHeight: "18px" }}
        >
          &#x2022; {row.status}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "createdAt"),
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Collaborators",
      selector: (row) => (
        <>
          {row?.fileUsers?.length > 0 ? (
            <div className="d-flex">
              {[...row.fileUsers.slice(0, 8)].map((e, id) => (
                <span className="collaborator-img" key={id} title={e.user.email}>
                  {e.user.email.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <div className="mx-2">-</div>
          )}
        </>
      ),
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Warnings",
      selector: (row) => (
        <div className={row.warning > 0 ? "clr-orange" : ""}>{row.warning || 0} Warnings</div>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "warning"),
      width: "150px",
    },
    {
      name: "Errors",
      selector: (row) => (
        <div className={row.error > 0 ? "clr-danger" : ""}>{row.error || 0} Errors</div>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "error"),
      width: "150px",
    },
    {
      name: "Actions",
      selector: (row) => <FilesPopover {...{ user, row, onDelete }} />,
      minWidth: "85px",
      maxWidth: "85px",
      center: true,
    },
  ];

  return (
    <>
      <Head>
        <title>APEX iXBRL - Dashboard</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        <div className="container py-3">
          <h5 className="fw-600"> Welcome, John</h5>
          <p className="fw-400">
            Simplify your SEC Compliance with our HTML to iXBRL conversion tool
          </p>

          <DashboardCards />

          <div className="card gap-3 p-2 p-sm-3  my-4">
            <div className="flex-between flex-wrap gap-2 gap-sm-3">
              <div className="fw-600 f-20 color">Conversion History</div>

              <div className="ms-auto">
                <input
                  className="w-100 border rounded f-12 search-input"
                  placeholder="Search Name"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDt({ ...dt, rst: true });
                  }}
                />
              </div>
            </div>

            <DataTable
              responsive
              customStyles={customStyles}
              className="table-height mt-2"
              columns={myFilesColumns}
              data={dt.data}
              progressPending={dt.ld}
              progressComponent={
                <div className="flex-grow-1 h-100">
                  <Spinner />
                </div>
              }
              fixedHeader
              persistTableHead
              highlightOnHover
              pointerOnHover
              pagination
              paginationServer
              paginationTotalRows={dt.count}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              paginationResetDefaultPage={dt.rst}
            />
            <Link href="/my-files" className="d-inline-flex ms-auto clr-primary f-12 f-i fw-600">
              View All Conversions {"->"}
            </Link>
          </div>

          <div className="d-flex flex-wrap flex-lg-nowrap gap-3">
            {[
              {
                title: "Support and Help",
                desc: "It is a long established fact that a reader will be distracted by the readable content of a page when",
                btn: "Talk to Us",
              },
              {
                title: "Looking for Answers?",
                desc: "It is a long established fact that a reader will be distracted by the readable content of a page when",
                btn: "Read FAQs",
              },
              {
                title: "Know What are Best Practices in Industry?",
                desc: "It is a long established fact that a reader will be distracted by the readable content of a page when",
                btn: "Know More >>",
              },
            ].map((e, id) => (
              <div className="card flex-grow-1 p-2 p-sm-3" key={id}>
                <Image
                  src={`/dashboard/${id + 3}.svg`}
                  alt="-"
                  className=""
                  width={74}
                  height={74}
                />

                <h6 className="fw-600 pt-2">{e.title}</h6>
                <p className="color-light f-12">{e.desc}</p>
                <div className="mt-auto">
                  <button className="btn btn-primary f-10 f-i fw-600">{e.btn}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
}
