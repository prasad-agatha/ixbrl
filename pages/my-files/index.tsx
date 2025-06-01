import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

import Layout from "@/layout";
import { customStyles, sortFunction } from "@/common/tableFunctions";
import { dateFormat, hasPermission } from "@/common/functions";
import MergeFiles from "@/components/modals/MergeFiles";
import { Spinner } from "@/components/loaders/Spinner";

import { useDebounce } from "@/hooks/useDebounce";

import FileService from "@/services/file.service";
import FilesPopover from "@/components/popover/FIlesPopover";

const fileService = new FileService();

export default function MyFiles({ user, mutate, router }) {
  const { isReady } = router;
  const [tab, setTab] = useState("All");
  const defaultData = { rst: false, ld: false, data: [], count: 0, pg: 1, pPg: 10 };
  const [modal, setModal] = useState<any>({ show: false, data: null });
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
  }, [user, isReady, tab, debounceSearch]);

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

  const merge = () => {
    //
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
        <title>APEX iXBRL - My Files</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        <div className="container py-3">
          <div className="card p-3">
            <h5 className="fw-600">My Files</h5>

            <div className="flex-between flex-wrap f-12 files-tabs">
              <div
                className={tab === "All" ? "active" : "color-light"}
                onClick={() => setTab("All")}
              >
                All Files
              </div>
              <span className="color-light">|</span>
              <div
                className="d-none"
                // className={tab === "Split" ? "active" : "color-light"}
                onClick={() => setTab("Split")}
              >
                Split Files
              </div>
              <section className="flex-center flex-wrap flex-sm-nowrap gap-2 ms-auto">
                <input
                  className="w-100 border rounded f-12 search-input"
                  placeholder="Search Name"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDt({ ...dt, rst: true });
                  }}
                />
                {tab === "Split" && (
                  <button
                    className="btn btn-outline-primary text-nowrap f-12 me-3"
                    onClick={() => setModal({ show: true, data: null })}
                  >
                    <img src="/icons/merge.svg" alt="-" /> Merge Files
                  </button>
                )}
                <Link
                  href="/new-file"
                  className={
                    hasPermission(user, "upload") ? "btn btn-primary text-nowrap f-12" : "d-none"
                  }
                >
                  <img src="/icons/plus.svg" alt="-" width={15} height={15} />
                  New File
                </Link>
              </section>
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
          </div>
        </div>
        {modal.show && <MergeFiles {...{ modal, setModal, merge }} />}
      </Layout>
    </>
  );
}
