import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";

import { customSearchStyles, sortFunction } from "@/common/tableFunctions";
import { useDebounce } from "@/hooks/useDebounce";

import FileService from "@/services/file.service";
import { parseContext } from "@/common/functions";

const fileService = new FileService();

export default function ContextPeriod({ cModal, setCModal, dt, onContextSubmit }) {
  const [search, setSearch] = useState<any>("");

  const close = () => setCModal({ ...cModal, data: null, show: false });

  const handleSubmit = async () => {
    onContextSubmit({ ...context });
    close();
  };

  const [loading, setLoading] = useState<any>(false);
  const [contexts, setContexts] = useState<any>([]);
  const [context, setContext] = useState<any>({
    Date: "",
    "End Date": "",
    Dimension: [],
    Member: [],
  });
  const [element, setElement] = useState<any>({ Dimension: "", Member: "" });

  const debounceText = useDebounce(search, 500).trim();
  useEffect(() => {
    const getSearch = async () => {
      try {
        setLoading(true);
        const txt = debounceText.trim();
        // TODO
        const searchData = await fileService.searchContext(dt.taxonomyId, txt);
        setContexts(
          searchData.map((e) => {
            return { ...parseContext((e.data || "").replaceAll("__", "_")), name: e.data };
          })
        );
        setLoading(false);
      } catch (e) {
        setLoading(false);
        toast.error(e || "Error");
      }
    };
    if (dt?.taxonomyId) getSearch();
  }, [dt?.taxonomyId, debounceText]);

  const selectContext = (row) => setContext(row);

  const elementsColumns: any = [
    {
      name: "Start",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Date || ""} onClick={() => selectContext(row)}>
          {row.Date || ""}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "Date"),
      width: "100px",
    },
    {
      name: "End",
      selector: (row) => (
        <span
          className="f-ellipsis"
          title={row["End Date"] || ""}
          onClick={() => selectContext(row)}
        >
          {row["End Date"] || ""}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "End Date"),
      width: "100px",
    },
    {
      name: "Dimension 1",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Dimension[0]} onClick={() => selectContext(row)}>
          {row.Dimension[0]}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Member/Value 1",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Member[0]} onClick={() => selectContext(row)}>
          {row.Member[0]}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Dimension 2",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Dimension[1]} onClick={() => selectContext(row)}>
          {row.Dimension[1]}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Member/value 2",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Member[1]} onClick={() => selectContext(row)}>
          {row.Member[1]}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Name",
      selector: (row) => (
        <span className="f-ellipsis" title={row.name} onClick={() => selectContext(row)}>
          {row.name}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "name"),
      width: "160px",
    },
  ];

  const extColumns: any = [
    {
      name: "Dimension",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Dimension} onClick={() => setElement(row)}>
          {row.Dimension}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "Dimension"),
      grow: 1,
    },
    {
      name: "Member",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Member} onClick={() => setElement(row)}>
          {row.Member}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "Member"),
      grow: 1,
    },
    {
      name: "",
      selector: (row) => (
        <span className="">
          <img
            src="/icons/cross.svg"
            alt="-"
            className="cr-p"
            onClick={() => {
              const data = { ...context };

              const opp = (ele) => (ele === "Dimension" ? "Member" : "Dimension");
              ["Dimension", "Member"].map((ele) => {
                data[ele] = [
                  ...data[ele].filter(
                    (e, id) => e !== row[ele] && data[opp(ele)][id] !== row[opp(ele)]
                  ),
                ];
              });

              setContext({ ...data });
            }}
          />
        </span>
      ),
      right: true,
      width: "60px",
      minWidth: "60px",
    },
  ];

  return (
    <Modal show={cModal.show} centered backdrop="static" size="lg" keyboard={false}>
      <Modal.Body>
        <div className="d-flex flex-column gap-2">
          <h5 className="fw-bold">Context Library Search</h5>
          <div className="flex-center">
            <label
              htmlFor="search"
              className="text-nowrap form-label f-14 mb-0 me-2"
              style={{ minWidth: "75px" }}
            >
              Filter
            </label>
            <div className="relative w-100">
              <input
                className="w-100 border rounded search-input"
                style={{ paddingRight: loading ? "4rem" : "1.75rem" }}
                placeholder="Search Context Name"
                id="search"
                autoFocus={true}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div
                className={loading ? "search-loading absolute" : "d-none"}
                style={{ top: "18px", right: "28px" }}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <DataTable
            responsive
            customStyles={customSearchStyles}
            className=""
            columns={elementsColumns}
            data={contexts}
            fixedHeader
            persistTableHead
            highlightOnHover
            pointerOnHover
            onRowClicked={(row: any) => selectContext(row)}
          />

          <label className="form-label text-black f-12">
            Showing {contexts.length} of {contexts.length}
          </label>

          <h6 className="fw-bold m-0">Properties</h6>
          <div className="d-flex gap-2">
            <input
              type="date"
              value={context.Date || ""}
              onChange={(e) => {
                if (context) setContext({ ...context, Date: e.target.value });
              }}
              className="form-control"
            />
            <input
              type="date"
              value={context["End Date"] || ""}
              onChange={(e) => {
                if (context) setContext({ ...context, ["End Date"]: e.target.value });
              }}
              className="form-control"
            />
          </div>

          <h6 className="fw-bold m-0 mt-3">Dimensions</h6>

          <div className="">
            <DataTable
              responsive
              customStyles={customSearchStyles}
              className="mb-3"
              columns={extColumns}
              data={context.Dimension.map((e, id) => {
                return { Dimension: e, Member: context.Member[id] };
              })}
              fixedHeader
              persistTableHead
              highlightOnHover
              pointerOnHover
              onRowClicked={(row: any) => setElement(row)}
            />
          </div>
          <h6 className="fw-bold m-0">Properties</h6>
          <div className="row w-100 m-0">
            {["Dimension", "Member"].map((el, id) => (
              <div key={id} className={[2, 3].includes(id) ? "col-6 p-1" : "col-12 p-1"}>
                <div className="flex-center">
                  <label htmlFor={el} className="text-nowrap text-dark w-70px f-12 me-2">
                    {el}
                  </label>
                  <div style={{ width: `calc(100% - 78px)` }}>
                    <input id={el} className="form-control f-12" value={element[el]} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          <div className="w-100 text-end">
            <button className="btn f-14 px-5 me-2" onClick={close}>
              Cancel
            </button>
            <button className="btn btn-primary f-14 px-5" onClick={handleSubmit}>
              Okay
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
