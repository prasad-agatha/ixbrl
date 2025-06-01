import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import axios, { CancelTokenSource, AxiosResponse } from "axios";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

import { exclude, generateContext, generateId, selectStyle } from "@/common/functions";
import { uploadToS3 } from "@/common/s3UploadData";
import ElementLibrary from "@/components/modals/ElementLibrary";
import ContextPeriod from "@/components/modals/ContextPeriod";
import { options } from "@/db/constants";

import FileService from "@/services/file.service";
import TaxonomyService from "@/services/taxonomy.service";
import DataTable from "react-data-table-component";
import { customSearchStyles, sortFunction } from "@/common/tableFunctions";

const taxonomyService = new TaxonomyService();
const fileService = new FileService();

const fields = [
  { lb: "Element", typ: "async" },
  { lb: "Data Type", typ: "input" },
  { lb: "Period", typ: "select" },
  { lb: "Balance", typ: "select" },
  { lb: "Unit", typ: "select" },
];

const display = [
  { lb: "Period Match", typ: "select" },
  { lb: "Indenting", typ: "select" },
  { lb: "Precision", typ: "select" },
  { lb: "Counted As", typ: "select" },
  { lb: "", typ: "radio" },
  { lb: "Label", typ: "input" },
];

const context = [
  { lb: "Use Preset", typ: "select" },
  { lb: "Type", typ: "select" },
  { lb: "Date", typ: "date" },
  { lb: "End Date", typ: "date" },
];

const extended = [
  { lb: "Dimension", typ: "async" },
  { lb: "Member", typ: "async" },
];

const footerNotes = ["References"];

const checkboxes = ["Negated", "Total Line", "Heading"];

export default function InlineFact(props) {
  const { editorInstance, fn, dt, defaultValues, setRender } = props;
  const { setFn, setValue, setEdit, setXbrlId, openModal, setOpenModal } = props;

  const [selectedValues, setSelectedValues] = useState<any>(defaultValues);
  const [ext, setExt] = useState<any>({});
  const [pExt, setPExt] = useState<any>({});
  const [ld, setLd] = useState(false);
  const [newFact, setNewFact] = useState(false);
  const [modal, setModal] = useState<any>({ data: null, show: false });
  const [cModal, setCModal] = useState<any>({ data: null, show: false });

  useEffect(() => {
    if (defaultValues["XBRL XDX Type"]) setFn(defaultValues["XBRL XDX Type"]);
  }, [defaultValues]);

  useEffect(() => {
    if (openModal) setModal({ ...modal, typ: "Element", show: true });
  }, [openModal]);

  const handleChange = (option, field) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [field]: option,
    }));
  };

  const selOptions = (lb) => {
    if (lb === "Unit")
      return [
        { label: "(default)", value: "" },
        ...(dt?.unit || []).map((e) => {
          return { label: e.name, value: e };
        }),
      ];
    if (lb === "Use Preset")
      return [
        {
          label: `${dt?.periodFrom?.split("T")[0]} - ${dt?.periodTo?.split("T")[0]}`,
          value: { Date: dt?.periodFrom?.split("T")[0], "End Date": dt?.periodTo?.split("T")[0] },
        },
      ];
    return options(lb);
  };

  const onSubmit = async () => {
    if (ld) return;
    try {
      const label = selectedValues["Label"];
      const element = selectedValues["Element"];
      const typ = selectedValues["Type"];
      const date = selectedValues["Date"];
      const endDate = selectedValues["End Date"];
      let ctxt = "";

      const isErr =
        fn === "Inline Label"
          ? !label
            ? "Enter Label"
            : !element
            ? "Select Element"
            : ""
          : !element
          ? "Select Element"
          : typ === "duration" && (!date || !endDate)
          ? "Select Date and End Date"
          : typ === "instant" && !date
          ? "Select End Date"
          : "";
      if (isErr) {
        toast.error(isErr);
        return;
      }

      setLd(true);

      if (defaultValues?.id) {
        const id = defaultValues.id;
        const uniqueId = id.split("_")[id.split("_").length - 1];
        const fnTyp = defaultValues["XBRL XDX Type"];

        const element = editorInstance.dom.select(`[id="${id}"]`);
        let node: any = null;
        if (element.length > 0) node = element[0];
        if (!node) {
          toast.error("Tag not found");
          return;
        }

        const newId = generateId(fnTyp, selectedValues, { uniqueId });
        ctxt += generateContext(selectedValues);
        editorInstance.dom.setAttrib(node, "id", newId);
        if (selectedValues["Label"])
          editorInstance.dom.setAttrib(node, "title", selectedValues["Label"]);
        else node.removeAttribute("title");

        setXbrlId(newId);
      } else {
        const generatedId = generateId(fn, selectedValues, { uniqueId: "" });

        const uniqueId = uuidv4();
        const alphanumericString = uniqueId.replace(/-/g, "");
        const selectText = editorInstance.selection.getContent();
        const id = generatedId + alphanumericString;
        ctxt += generateContext(selectedValues);

        if (["Inline Fact", "Inline Label"].includes(fn)) {
          if (selectedValues["Label"])
            editorInstance.selection.setContent(
              `<font id="${id}" title="${selectedValues["Label"]}">${selectText}</font>`
            );
          else editorInstance.selection.setContent(`<font id="${id}">${selectText}</font>`);
        } else if (fn === "Block Fact") {
          const node = editorInstance.selection.getNode();

          if (node) editorInstance.dom.setAttrib(node, "id", id);
          if (node && selectedValues["Label"])
            editorInstance.dom.setAttrib(node, "title", selectedValues["Label"]);
        }
      }
      const htmlData = editorInstance.getContent();

      const urlSplits = dt.url.split("/");
      const urlName = urlSplits[urlSplits.length - 1];
      const key = urlName.split(".")[0] + "_1." + urlName.split(".")[1];
      const uploadedUrl = await uploadToS3(htmlData, key);

      await fileService.updateFile(dt.id, { ...dt, extra: { ...dt.extra, url: uploadedUrl } });
      if (ctxt) await fileService.createContext(dt.id, { name: ctxt.replace("_c", "") });

      setValue(htmlData);
      setEdit(false);
      setFn("");
      setSelectedValues({});
      setRender((pR) => !pR);
    } catch (e) {
      toast.error(e || "Error");
    }
    setLd(false);
  };

  const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);

  const loadOptions = (value: string, callback: (options: any[]) => void) => {
    if (cancelTokenSource) cancelTokenSource.cancel("New request initiated");

    const newCancelTokenSource = axios.CancelToken.source();
    setCancelTokenSource(newCancelTokenSource);

    axios
      .get(`/taxonomy/${dt.taxonomyId}?file=Presentation&search=${value}`, {
        cancelToken: newCancelTokenSource.token,
      })
      .then((res: AxiosResponse) => {
        const options = res.data.map((e: any) => ({
          label: (
            <span className="text-nowrap" title={e.name}>
              {e.name}
            </span>
          ),
          value: e,
        }));
        callback(options);
      });
  };

  const onModalSubmit = (modalData: any) => {
    if (!modalData) return;
    if (modalData.typ === "Element") {
      const data = { ...exclude(selectedValues, ["End Date"]) };
      data[modalData.typ] = {
        cn: modalData.cn,
        name: modalData.name,
        label: modalData.label_x,
      };
      data["Data Type"] = modalData.dataType;
      data["Period"] = modalData.period;
      data["Type"] = modalData.period;
      data["Balance"] = modalData.balance;
      if (modalData.period === "duration" && selectedValues)
        data["End Date"] = selectedValues["End Date"];
      setSelectedValues({ ...data });
    } else {
      const data = { ...ext };
      data[modalData.typ] = modalData.name;
      setExt({ ...data });
    }
  };

  const onContextSubmit = (ctxt) => setSelectedValues({ ...selectedValues, ...ctxt });

  const updExt = (row) => {
    setPExt(row);
    setExt(row);
  };

  const extColumns: any = [
    {
      name: "Dimension",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Dimension} onClick={() => updExt(row)}>
          {row.Dimension}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "Dimension"),
      width: "160px",
    },
    {
      name: "Member",
      selector: (row) => (
        <span className="f-ellipsis" title={row.Member} onClick={() => updExt(row)}>
          {row.Member}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "Member"),
      width: "160px",
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
              const data = { ...selectedValues };

              const opp = (ele) => (ele === "Dimension" ? "Member" : "Dimension");
              ["Dimension", "Member"].map((ele) => {
                data[ele] = [
                  ...data[ele].filter(
                    (e, id) => e !== row[ele] && data[opp(ele)][id] !== row[opp(ele)]
                  ),
                ];
              });

              setSelectedValues({ ...data });
              if (pExt["Dimension"] === row.Dimension && pExt["Member"] === row.Member) setPExt({});
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
    <div className="p-3 px-2">
      <p className="border-bottom fw-bold f-14">{fn} Element</p>

      {fn === "Inline Label" ? (
        <div className="row w-100 m-0">
          <div className="col-12 p-1">
            <div className="flex-center">
              <label htmlFor={"Element"} className="text-nowrap text-dark w-70px f-12 me-2">
                {"Element"}
              </label>
              <div style={{ width: `calc(100% - 78px)` }}>
                <AsyncSelect
                  instanceId={`react-select-${"Element"}`}
                  styles={selectStyle("12px", "32px")}
                  placeholder={`Search Element Name`}
                  defaultOptions={[]}
                  loadOptions={(value, callback) => loadOptions(value, callback)}
                  value={
                    selectedValues["Element"]
                      ? {
                          label: selectedValues["Element"].name,
                          value: selectedValues["Element"],
                        }
                      : null
                  }
                  onChange={async (event: any) => {
                    const data = { ...selectedValues };
                    data["Element"] = event.value;
                    setSelectedValues({ ...data });
                    const elementData = await taxonomyService.searchTaxonomy(
                      `${dt.taxonomyId}?file=Presentation&elementId=${event.value.cn}`
                    );

                    data["Data Type"] = elementData[0].dataType;
                    data["Period"] = elementData[0].period;
                    data["Type"] = elementData[0].period;
                    data["Balance"] = elementData[0].balance;

                    setSelectedValues({ ...data });
                  }}
                />
              </div>
              <img
                src="/icons/search.svg"
                alt="-"
                className="ms-2 cr-p"
                onClick={() => setModal({ ...modal, typ: "Element", show: true })}
              />
            </div>
          </div>

          <div className="col-12 p-1 mb-2">
            <div className="flex-center">
              <label htmlFor="Label" className="text-nowrap text-dark w-70px f-12 me-2">
                Label
              </label>
              <div style={{ width: "calc(100% - 78px)" }}>
                <input
                  id="Label"
                  className="form-control f-12"
                  value={selectedValues["Label"]}
                  onChange={(e) => handleChange(e.target.value, "Label")}
                  placeholder={`Enter ${"Label"}`}
                  disabled={["Data Type"].includes("Label")}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row w-100 m-0">
            {fields.map((el, id) => (
              <div key={id} className={[2, 3].includes(id) ? "col-6 p-1" : "col-12 p-1"}>
                <div className="flex-center">
                  <label htmlFor={el.lb} className="text-nowrap text-dark w-70px f-12 me-2">
                    {el.lb}
                  </label>
                  <div style={{ width: `calc(100% - 78px)` }}>
                    {el.typ === "async" ? (
                      <AsyncSelect
                        instanceId={`react-select-${el.lb}`}
                        styles={selectStyle("12px", "32px")}
                        placeholder={`Search ${el.lb === "Element" ? `${el.lb} Name` : `${el.lb}`}`}
                        defaultOptions={[]}
                        loadOptions={(value, callback) => loadOptions(value, callback)}
                        value={
                          selectedValues[el.lb]
                            ? {
                                label: selectedValues[el.lb].name,
                                value: selectedValues[el.lb],
                              }
                            : null
                        }
                        onChange={async (event: any) => {
                          const elementData = await taxonomyService.searchTaxonomy(
                            `${dt.taxonomyId}?file=Presentation&elementId=${event.value.cn}`
                          );

                          const data = { ...exclude(selectedValues, ["End Date"]) };
                          data[el.lb] = event.value;
                          data["Data Type"] = elementData[0].dataType;
                          data["Period"] = elementData[0].period;
                          data["Type"] = elementData[0].period;
                          data["Balance"] = elementData[0].balance;
                          if (elementData[0].period === "duration" && selectedValues)
                            data["End Date"] = selectedValues["End Date"];
                          setSelectedValues({ ...data });
                        }}
                      />
                    ) : el.typ === "select" ? (
                      <Select
                        instanceId={`react-select-${el.lb}`}
                        classNamePrefix="select"
                        styles={selectStyle("12px", "32px")}
                        placeholder={`${el.lb === "Period" ? "" : "Select"} ${el.lb}`}
                        options={selOptions(el.lb)}
                        value={selOptions(el.lb).find(
                          (ele) => ele.value === (selectedValues[el.lb] || "")
                        )}
                        onChange={(e: any) => {
                          const data = { ...selectedValues, [el.lb]: e.value };
                          setSelectedValues({ ...data });
                        }}
                        isDisabled={["Period", "Balance"].includes(el.lb)}
                      />
                    ) : (
                      <input
                        id={el.lb}
                        className="form-control f-12"
                        value={selectedValues[el.lb]}
                        onChange={(e) => handleChange(e.target.value, el.lb)}
                        placeholder={`Enter ${el.lb}`}
                        disabled={["Data Type"].includes(el.lb)}
                      />
                    )}
                  </div>
                  {el.typ === "async" && (
                    <img
                      src="/icons/search.svg"
                      alt="-"
                      className="ms-2 cr-p"
                      onClick={() => setModal({ ...modal, typ: el.lb, show: true })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Display Options */}
          <p className="border-bottom fw-bold f-14 mt-2">Display Options</p>
          <div className="row w-100 m-0">
            {display.map((el, id) => (
              <div key={id} className={[1, 2, 3].includes(id) ? "col-8 p-1" : "col-12 p-1"}>
                <div className="flex-center">
                  <label
                    htmlFor={el.lb}
                    className={el.lb ? "text-nowrap text-dark w-70px f-12 me-2" : ""}
                  >
                    {el.lb}
                  </label>
                  <div style={{ width: el.lb ? "calc(100% - 78px)" : "100%" }}>
                    {el.typ === "radio" ? (
                      <div className="d-flex align-items-center">
                        {checkboxes.map((checkbox, id) => (
                          <div key={id} className="flex-center me-3">
                            <input
                              type="checkbox"
                              id={checkbox}
                              checked={selectedValues[checkbox] || false}
                              onChange={(event) => handleChange(event.target.checked, checkbox)}
                            />
                            <label htmlFor={checkbox} className="f-12 text-dark ms-1">
                              {checkbox}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : el.typ === "select" ? (
                      <Select
                        instanceId={`react-select-${el.lb}`}
                        classNamePrefix="select"
                        styles={selectStyle("12px", "32px")}
                        placeholder={`${el.lb === "Period" ? "" : "Select"} ${el.lb}`}
                        options={selOptions(el.lb)}
                        value={selOptions(el.lb).find(
                          (ele) => ele.value === (selectedValues[el.lb] || "")
                        )}
                        onChange={(e: any) => {
                          const data = { ...selectedValues, [el.lb]: e.value };
                          setSelectedValues({ ...data });
                        }}
                      />
                    ) : (
                      <input
                        id={el.lb}
                        className="form-control f-12"
                        value={selectedValues[el.lb]}
                        onChange={(e) => handleChange(e.target.value, el.lb)}
                        placeholder={`Enter ${el.lb}`}
                        disabled={["Data Type"].includes(el.lb)}
                      />
                    )}
                  </div>
                  {el.lb === "Period Match" && (
                    <button className="btn bg-body f-10 ms-2" style={{ height: "32px" }}>
                      Advanced...
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <hr className="mb-2" />
          {/* Context Period */}
          <p className="border-bottom fw-bold f-14 mt-2">Context Period</p>
          <div className="row w-100 m-0">
            {context.map((el, id) => (
              <div key={id} className={id === 1 ? "col-6 p-1" : "col-12 p-1"}>
                <div className="flex-center">
                  <label htmlFor={el.lb} className={"text-nowrap text-dark w-70px f-12 me-2"}>
                    {el.lb}
                  </label>
                  <div style={{ width: "calc(100% - 78px)" }}>
                    {el.typ === "select" ? (
                      <Select
                        instanceId={`react-select-${el.lb}`}
                        classNamePrefix="select"
                        styles={selectStyle("12px", "32px")}
                        placeholder={`${el.lb === "Type" ? "" : "Select"} ${el.lb}`}
                        options={selOptions(el.lb)}
                        value={selOptions(el.lb).find(
                          (ele) => ele.value === (selectedValues[el.lb] || "")
                        )}
                        onChange={(e: any) => {
                          let data = { ...exclude(selectedValues, ["End Date"]) };
                          if (el.lb === "Use Preset")
                            data = {
                              ...data,
                              ...exclude(e.value, data?.Type === "instant" ? ["End Date"] : []),
                            };
                          else data = { ...data, [el.lb]: e.value };

                          if (el.lb === "Type" && e.value === "duration" && selectedValues)
                            data["End Date"] = selectedValues["End Date"];

                          setSelectedValues({ ...data });
                        }}
                      />
                    ) : (
                      el.typ === "date" && (
                        <input
                          type="date"
                          id={el.lb}
                          className="form-control f-12"
                          value={selectedValues[el.lb] || ""}
                          onChange={(e) => handleChange(e.target.value, el.lb)}
                          placeholder={`Enter ${el.lb}`}
                        />
                      )
                    )}
                  </div>
                  {el.lb === "Use Preset" && (
                    <img
                      src="/icons/search.svg"
                      alt="-"
                      className="ms-2 cr-p"
                      onClick={() => setCModal({ data: null, show: true })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <hr />
          {/* Extended Information */}
          <p className="border-bottom fw-bold f-14 mt-2">Extended Information</p>
          <div className="row w-100 m-0">
            {extended.map((el, id) => (
              <div key={id} className="col-12 p-1" style={{ zIndex: id ? "99" : "999" }}>
                <div className="flex-center">
                  <label htmlFor={el.lb} className="text-nowrap text-dark w-70px f-12 me-2">
                    {el.lb}
                  </label>
                  <div style={{ width: "calc(100% - 78px)" }}>
                    <AsyncSelect
                      instanceId={`react-select-${el.lb}`}
                      styles={selectStyle("12px", "32px")}
                      placeholder={`Search ${el.lb === "Element" ? `${el.lb} Name` : `${el.lb}`}`}
                      defaultOptions={[]}
                      loadOptions={(value, callback) => loadOptions(value, callback)}
                      value={
                        ext[el.lb]
                          ? {
                              label: ext[el.lb],
                              value: ext[el.lb],
                            }
                          : null
                      }
                      onChange={(event: any) => {
                        const data = { ...ext };
                        data[el.lb] = event.value.name;
                        setExt({ ...data });
                      }}
                    />
                  </div>

                  <img
                    src="/icons/search.svg"
                    alt="-"
                    className="ms-2 cr-p"
                    onClick={() => setModal({ ...modal, typ: el.lb, show: true })}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="text-end p-0 pt-2">
            {pExt?.Dimension && (
              <button
                className="btn f-10 px-4"
                onClick={() => {
                  setPExt({});
                  setExt({});
                }}
              >
                Cancel
              </button>
            )}
            <button
              className="btn btn-primary f-10 px-4"
              onClick={() => {
                if (!ext?.Dimension || !ext?.Member) return;
                const data = { ...selectedValues };

                const opp = (ele) => (ele === "Dimension" ? "Member" : "Dimension");
                ["Dimension", "Member"].map((ele) => {
                  if (pExt?.Dimension)
                    data[ele] = [
                      ...data[ele].map((e, id) => {
                        if (e === pExt[ele] && data[opp(ele)][id] === pExt[opp(ele)])
                          return ext[ele];
                        else return e;
                      }),
                    ];
                  else
                    data[ele] = [
                      ...data[ele].filter(
                        (e, id) => e !== pExt[ele] && data[opp(ele)][id] !== pExt[opp(ele)]
                      ),
                      ext[ele],
                    ];
                });

                if (pExt?.Dimension) setPExt({});
                setSelectedValues({ ...data });
                setExt({});
              }}
            >
              {pExt?.Dimension ? "Apply" : "Add"}
            </button>
          </div>
          <div className="mt-3">
            <DataTable
              responsive
              customStyles={customSearchStyles}
              className="mb-3"
              columns={extColumns}
              data={selectedValues.Dimension.map((e, id) => {
                return { Dimension: e, Member: selectedValues.Member[id] };
              })}
              fixedHeader
              persistTableHead
              highlightOnHover
              pointerOnHover
              onRowClicked={(row: any) => updExt(row)}
            />
          </div>
          <hr />
          {/* Footer notes */}
          <p className="border-bottom fw-bold f-14">Footer notes</p>{" "}
          <div className="px-2">
            {footerNotes.map((e, id) => (
              <div key={id} className="d-flex align-items-center mb-2">
                <label htmlFor={e} style={{ flex: "1 1 100px" }} className="text-dark f-12 me-2">
                  {e}
                </label>

                <input
                  id={e}
                  className="form-control f-12"
                  value={selectedValues[e]}
                  onChange={(el) => handleChange(el.target.value, e)}
                  placeholder={`Enter ${e}`}
                />
              </div>
            ))}
            <p className="f-12">
              Enter the footnote references as they appear in the HTML or as a space separated list.
            </p>
            <div className={fn === "Inline Fact" ? "d-flex align-items-center gap-2" : "d-none"}>
              <span className="clr-danger pt-2"> *</span>
              <input
                type="checkbox"
                id="newFact"
                checked={newFact || false}
                onChange={(event) => setNewFact(event.target.checked)}
              />
              <label htmlFor="newFact" className="f-12 text-dark">
                This value is used for more facts (Wizard will run again)
              </label>
            </div>

            {fn === "Inline Fact" && <h6 className=" f-14 ">Facts added for this section : 0</h6>}
          </div>
          <hr />
        </>
      )}

      <div className="w-100 text-end p-1">
        <button
          className="btn f-12 px-4 me-2"
          onClick={() => {
            const selectText = editorInstance.selection.getContent();
            editorInstance.selection.setContent(selectText);
            setEdit(false);
            setFn("");
            setSelectedValues({});
          }}
        >
          Cancel
        </button>
        <button className="btn btn-primary f-12 px-4" onClick={onSubmit}>
          {ld && <Spinner animation="border" className="me-2 sp-75" />}
          Save
        </button>
      </div>

      {modal.show && <ElementLibrary {...{ modal, setModal, setOpenModal, dt, onModalSubmit }} />}
      {cModal.show && <ContextPeriod {...{ cModal, setCModal, dt, onContextSubmit }} />}
    </div>
  );
}
