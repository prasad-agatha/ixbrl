import { useEffect, useState } from "react";
import { Accordion, Spinner } from "react-bootstrap";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { toast } from "react-toastify";

import { selectStyle } from "@/common/functions";
import { customSearchStyles, sortFunction } from "@/common/tableFunctions";
import TreeView from "@/components/TreeView";

import { useDebounce } from "@/hooks/useDebounce";

import TaxonomyService from "@/services/taxonomy.service";

const taxonomyService = new TaxonomyService();

export default function TaxonomyViewer({ dt }) {
  const [network, setNetwork] = useState<any>(
    dt?.taxonomy?.data?.treeViews?.length > 0 ? dt?.taxonomy?.data?.treeViews[0] : null
  );
  const [search, setSearch] = useState<any>("");
  const [loading, setLoading] = useState<any>(false);
  const [copyId, setCopyId] = useState<any>("");
  const [load, setLoad] = useState<any>(false);
  const [elements, setElements] = useState<any>([]);
  const [element, setElement] = useState<any>(null);
  const [elementId, setElementId] = useState<any>("");

  const debounceText = useDebounce(search, 500).trim();
  useEffect(() => {
    const getSearch = async () => {
      try {
        setLoading(true);
        const searchData = await taxonomyService.searchTaxonomy(
          `${dt.taxonomyId}?file=${network.label}&search=${debounceText}`
        );
        setElements(searchData);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        toast.error(e || "Error");
      }
    };
    if (dt?.taxonomyId) getSearch();
  }, [network, dt?.taxonomyId, debounceText]);

  useEffect(() => {
    const getElement = async () => {
      try {
        setLoad(true);
        const elementData = await taxonomyService.searchTaxonomy(
          `${dt.taxonomyId}?file=${network.label}&elementId=${elementId}`
        );
        if (elementData.length > 0) setElement(elementData[0]);
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
        <span className="f-ellipsis" title={row.name} onClick={() => setElementId(row.cn)}>
          {row.name}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "name"),
      width: "250px",
      grow: 1,
    },
    {
      name: "Element Label",
      selector: (row) => (
        <span className="f-ellipsis" title={row.label} onClick={() => setElementId(row.cn)}>
          {row.label}
        </span>
      ),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "label"),
      width: "275px",
      grow: 1,
    },
  ];

  const copy = (ele: any, id: any) => {
    navigator.clipboard.writeText(ele);
    const tooltip = document.getElementById(id) as HTMLElement;
    tooltip.innerHTML = "Copied!";
    tooltip.classList.add("tooltip-visible");
  };

  const onMouseOut = (id: any) => {
    const tooltip = document.getElementById(id) as HTMLElement;
    tooltip.innerHTML = "";
    tooltip.classList.remove("tooltip-visible");
  };

  const properties = [
    { lb: "Name", vl: "name" },
    { lb: "Data Type", vl: "dataType" },
    { lb: "Substitution Group", vl: "substitutionGroup" },
    { lb: "Period Type", vl: "period" },
    { lb: "Abstract", vl: "abstract" },
  ];

  const labels = [
    { lb: "Standard Label", vl: "label_x" },
    { lb: "Documentation", vl: "documentation" },
  ];

  const elementValues = (type) => (
    <>
      {type.map((e, id) => (
        <div
          className="border-bottom flex-between search-table"
          key={id}
          onMouseEnter={() => setCopyId(e.lb + "" + id)}
        >
          <div className="f-ellipsis">{e.lb}</div>
          <div className="f-ellipsis" title={element[e.vl]}>
            {element[e.vl]}
          </div>
          <div className="relative p-0">
            <span className="tooltip-text" id={e.lb + "" + id}></span>
            <img
              src="/icons/copy.svg"
              alt="-"
              className={copyId === e.lb + "" + id ? "cr-p" : "d-none"}
              style={{ opacity: "0.5" }}
              onClick={() => copy(`${element[e.vl]}`, `${copyId}`)}
              onMouseOut={() => onMouseOut(`${copyId}`)}
            />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="p-3 px-2 f-14 relative">
      <div className="d-flex align-items-center">
        <div className="d-flex w-100px f-12">
          <div className="f-ellipsis" style={{ maxWidth: "65px" }}>
            Taxonomy
          </div>
          {/* <div className="clr-danger"> &nbsp;*</div> */}
        </div>
        <div className="w-100">
          <Select
            classNamePrefix="select"
            instanceId="react-select-taxonomy"
            styles={selectStyle("12px", "32px")}
            placeholder={"Select Taxonomy"}
            options={[]}
            value={dt?.taxonomy?.name ? { label: dt.taxonomy.name, value: dt.taxonomy.name } : null}
          />
        </div>
      </div>

      <div className="relative">
        <input
          className="w-100 border rounded f-12 my-3 search-input"
          style={{ paddingRight: loading ? "4rem" : "1.75rem" }}
          placeholder="Search Element Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div
          className={loading ? "search-loading absolute" : "d-none"}
          style={{ top: "28px", right: "28px" }}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {elements.length > 0 && (
        <DataTable
          responsive
          customStyles={customSearchStyles}
          className="mb-3"
          columns={elementsColumns}
          data={elements}
          fixedHeader
          persistTableHead
          highlightOnHover
          pointerOnHover
          onRowClicked={(row: any) => setElementId(row.cn)}
        />
      )}

      <div>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              Property Details{load && <Spinner animation="border" className="sp-75 ms-2" />}
            </Accordion.Header>
            <Accordion.Body>
              {element ? (
                <>
                  <div className="f-12 text-black mb-2">Properties</div>
                  <div className="bg-body flex-between search-table">
                    <div className="f-ellipsis color-light">Property</div>
                    <div className="f-ellipsis color-light">Value</div>
                    <div></div>
                  </div>
                  {elementValues(properties)}
                  <div className="f-12 text-black my-2">Labels</div>
                  <div className="bg-body flex-between search-table">
                    <div className="f-ellipsis color-light">Property</div>
                    <div className="f-ellipsis color-light">Value</div>
                    <div></div>
                  </div>
                  {elementValues(labels)}
                </>
              ) : (
                <></>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <div className="mt-3">
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Network Browser</Accordion.Header>
            <Accordion.Body>
              <div className="d-flex align-items-center mt-3">
                <div className="d-flex w-100px f-12">
                  <div className="f-ellipsis" style={{ maxWidth: "65px" }}>
                    Network
                  </div>
                </div>
                <div className="w-100">
                  <Select
                    classNamePrefix="select"
                    instanceId="react-select-taxonomy"
                    styles={selectStyle("12px", "32px")}
                    placeholder={"Presentation"}
                    options={dt?.taxonomy?.data?.treeViews || []}
                    value={network}
                    onChange={(e: any) => {
                      setNetwork(e);
                      setElementId("");
                      setElement(null);
                    }}
                  />
                </div>
              </div>
              <div className="border-top m-2"></div>

              <div className="network-browser" id="network-browser">
                {network ? (
                  <TreeView url={network.value} {...{ element, elementId, setElementId }} />
                ) : (
                  <div className="flex-center h-100">
                    <Spinner animation="border" className="sp-1" />
                  </div>
                )}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
