import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";

import { getLabel, selectStyle } from "@/common/functions";
import match from "@/common/stringMatching";
import { customSearchStyles, sortFunction } from "@/common/tableFunctions";

import { options } from "@/db/constants";
import { useDebounce } from "@/hooks/useDebounce";

import TaxonomyService from "@/services/taxonomy.service";

const taxonomyService = new TaxonomyService();

const fields = [
  { lb: "Data Type", vl: "dataType" },
  { lb: "Deprecated", vl: "deprecated" },
  { lb: "", vl: "" },
  { lb: "Balance", vl: "balance" },
  { lb: "Period", vl: "period" },
  { lb: "Abstract", vl: "abstract" },
  { lb: "SIC Code", vl: "sic" },
];

const fieldValues = [
  { lb: "Data Type", vl: "dataType" },
  { lb: "Substitution Group", vl: "substitutionGroup" },
  { lb: "Balance", vl: "balance" },
  { lb: "Period", vl: "period" },
  { lb: "Abstract", vl: "abstract" },
];

export default function ElementLibrary({ modal, setModal, setOpenModal, dt, onModalSubmit }) {
  const defaultFilters = () => {
    return {
      dataType: "",
      deprecated: "false",
      balance: "",
      period: "",
      abstract: "false",
      sic: "",
    };
  };
  const [search, setSearch] = useState<any>("");
  const [fSearch, setFSearch] = useState<any>(false);
  const [filter, setFilter] = useState<any>({ ...defaultFilters() });
  const [entities, setEntities] = useState<any>(null);

  useEffect(() => {
    const getOpts = async () => {
      try {
        const url = dt?.taxonomy?.data?.fields;
        const response = await fetch(url);
        const jsonFields = await response.json();
        setEntities(jsonFields[0]);
      } catch (e) {
        toast.error(e || "Error");
      }
    };
    getOpts();
  }, [dt?.taxonomy?.data?.fields]);

  const roleOpts = (lb) => {
    const opt = lb.includes("SIC") ? null : { label: "(All)", value: "" };

    let opts: any = [];

    if (["Data Type", "Deprecated", "Balance", "Period", "Abstract"].includes(lb) && entities) {
      opts = (entities[lb === "Data Type" ? "dataType" : lb.toLowerCase()] || []).map((e) => {
        return {
          label:
            e === "true" ? (
              "Yes"
            ) : e === "false" ? (
              "No"
            ) : lb === "Data Type" ? (
              <span className="text-nowrap" title={e}>
                {e}
              </span>
            ) : (
              getLabel(e)
            ),
          value: e,
        };
      });
    } else opts = [...options(lb)];
    if (opt) opts.unshift(opt);
    return [...opts];
  };

  const close = async () => {
    setModal({ ...modal, data: null, show: false });
    setOpenModal(false);
  };
  const handleSubmit = async () => {
    onModalSubmit({ typ: modal.typ, ...modal.data });
    close();
  };

  const [loading, setLoading] = useState<any>(false);
  const [load, setLoad] = useState<any>(false);

  const [elements, setElements] = useState<any>([]);
  const [searchTxt, setSearchTxt] = useState<any>("");
  const [element, setElement] = useState<any>({});
  const [elementId, setElementId] = useState<any>("");

  const selectElement = (row) => setElementId(row.cn);

  const debounceText = useDebounce(search, 500).trim();
  useEffect(() => {
    const getSearch = async () => {
      try {
        setLoading(true);
        const payload = Object.fromEntries(
          Object.entries(filter).filter(([_, value]) => value !== "")
        );
        payload["name"] = debounceText.trim();
        const searchData = await taxonomyService.searchFilterTaxonomy(dt.taxonomyId, payload);
        setSearchTxt(payload["name"]);
        setElements(searchData);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        toast.error(e || "Error");
      }
    };
    if (dt?.taxonomyId && debounceText.trim()) getSearch();
  }, [dt?.taxonomyId, filter, debounceText]);

  useEffect(() => {
    const getElement = async () => {
      try {
        setLoad(true);
        const elementData = await taxonomyService.searchTaxonomy(
          `${dt.taxonomyId}?file=Presentation&elementId=${elementId}`
        );
        if (elementData.length > 0) {
          setElement(elementData[0]);
          setModal({ ...modal, data: elementData[0] });
        }
        setLoad(false);
      } catch (e) {
        setLoad(false);
        toast.error(e || "Error");
      }
    };
    if (elementId) getElement();
  }, [elementId]);

  const elementsColumns: any = [
    {
      name: "Element Name",
      selector: (row) => (
        <span className="f-ellipsis" title={row.name} onClick={() => selectElement(row)}>
          {row.name}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "name"),
      grow: 1,
    },
    {
      name: "Match",
      selector: (row) => (
        <span className="f-ellipsis" onClick={() => selectElement(row)}>
          {match(searchTxt, row.name)}
          {" %"}
        </span>
      ),
      right: true,
      width: "80px",
      minWidth: "80px",
    },
    {
      name: "Flags",
      selector: (row) => (
        <span className="f-ellipsis" onClick={() => selectElement(row)}>
          {row["Filer Usage Count"]}
        </span>
      ),
      right: true,
      width: "80px",
      minWidth: "80px",
    },
  ];

  return (
    <Modal show={modal.show} centered backdrop="static" size="lg" keyboard={false}>
      <Modal.Body>
        <div className="d-flex flex-column gap-2">
          <h5 className="fw-bold">Element Library Search</h5>
          <div className="flex-center">
            <label
              htmlFor="search"
              className="text-nowrap form-label f-14 mb-0 me-2"
              style={{ minWidth: "75px" }}
            >
              Look for
            </label>

            <div className="relative w-100">
              <input
                className="w-100 border rounded search-input"
                style={{ paddingRight: loading ? "4rem" : "1.75rem" }}
                placeholder="Search Element Name"
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
            <div className="mx-2">
              <label className="flex-center d-inline-flex gap-1">
                <input
                  name="fullSearch"
                  type="checkbox"
                  className=""
                  checked={fSearch}
                  onChange={() => setFSearch(!fSearch)}
                />
                <p className="text-nowrap f-12 m-0">Match full words only</p>
              </label>
            </div>
            <span className="color-light me-2">|</span>
            <img
              src="/icons/reset.svg"
              alt="-"
              width={16}
              height={16}
              className="cr-p"
              onClick={() => {
                setFilter({ ...defaultFilters() });
                setSearch("");
                setFSearch(false);
                setElements([]);
              }}
            />
          </div>
          <div className="row px-2" style={{ zIndex: "999" }}>
            {fields.map((el, id) => (
              <div
                className={"col-12 p-1 py-2 flex-center " + (id == 0 ? "col-md-6" : "col-md-3")}
                key={id}
              >
                <label
                  htmlFor={el.lb}
                  className="text-nowrap form-label f-14 mb-0 me-2"
                  style={{ minWidth: "75px" }}
                >
                  {el.lb}
                </label>

                {el.lb && (
                  <div className="w-100">
                    <Select
                      instanceId={`react-select-${el.lb}`}
                      classNamePrefix="select"
                      styles={selectStyle("16px", "38px")}
                      placeholder={el.lb.includes("SIC") ? "" : el.lb}
                      options={roleOpts(el.lb)}
                      value={roleOpts(el.lb).find((ele) => ele.value === filter[el.vl])}
                      onChange={(e: any) => {
                        setFilter({ ...filter, [el.vl]: e.value });
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <hr className="my-2" />

          <h6 className="fw-bold m-0">Elements</h6>
          <div className="row px-2">
            <div className="col-12 p-1 flex-center">
              <label className="text-nowrap form-label f-14 mb-0 me-2" style={{ minWidth: "75px" }}>
                Name
              </label>

              <input className="form-control f-12" value={(element?.name || ":").split(":")[1]} />
            </div>
          </div>

          <DataTable
            responsive
            customStyles={customSearchStyles}
            className=""
            columns={elementsColumns}
            data={elements}
            fixedHeader
            persistTableHead
            highlightOnHover
            pointerOnHover
            onRowClicked={(row: any) => selectElement(row)}
          />

          <div className="flex-between text-black f-12">
            <label className="form-label ">
              Only Displaying:<span> xbrli:item</span>
            </label>
            <label className="form-label ">
              Flags:<span>E=Extended Element, U=Used in report</span>
            </label>
            <label className="form-label">
              {elements.length} <span> Elements Found</span>
            </label>
          </div>

          <h6 className="d-flex align-items-center fw-bold m-0">
            Properties{load && <Spinner animation="border" className="sp-75 ms-2" />}
          </h6>

          <div className="row px-2">
            <div className="col-12 col-md-6">
              {fieldValues.map((el, id) => (
                <div className="col-12 p-1 py-2 flex-center" key={id}>
                  <label
                    htmlFor={el.lb}
                    className="text-nowrap form-label f-14 mb-0 me-2"
                    style={{ minWidth: "125px" }}
                  >
                    {el.lb}
                  </label>

                  {el.lb && (
                    <div className="w-100">
                      <input className="form-control f-12" value={element[el.vl] || ""} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="col-12 col-md-6">
              {[
                { lb: "Label", vl: "label_y" },
                { lb: "", vl: "documentation" },
              ].map((el, id) => (
                <div className="col-12 p-1 py-2 flex-center" key={id}>
                  <label
                    htmlFor={el.lb}
                    className="text-nowrap form-label f-14 mb-0 me-2"
                    style={{ minWidth: "125px" }}
                  >
                    {el.lb}
                  </label>

                  {el.lb ? (
                    <div className="w-100">
                      <input className="form-control f-12" value={element[el.vl] || ""} />
                    </div>
                  ) : (
                    <textarea
                      className="form-control f-12"
                      id="floatingTextarea2"
                      rows={9}
                      value={element[el.vl] || ""}
                    ></textarea>
                  )}
                </div>
              ))}
            </div>
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
