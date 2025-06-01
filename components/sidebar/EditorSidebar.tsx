import { ReactSVG } from "react-svg";
import { IXBRLTags, TaxonomyViewer, ManagementView } from "@/components/sidebar";

export default function EditorSidebar(props) {
  const { fn, setFn, editorInstance, parentTags, dt } = props;
  const { openModal, setOpenModal, xbrlId, setXbrlId, tab, setTab, setValue } = props;
  return (
    <>
      <div className="flex-between">
        {["iXBRL Tags", "Taxonomy Viewer", "Management View"].map((e, id) => (
          <div
            className={"sidebar-tab" + (tab === e ? " active" : "")}
            key={id}
            onClick={() => setTab(e)}
          >
            <div style={{ minHeight: "24px" }}>
              <ReactSVG src={`/file/${e}.svg`} />
            </div>
            <h6 className="f-i f-10">{e}</h6>
          </div>
        ))}
      </div>
      {/* <h6 className="border-top border-bottom fw-600 f-14 m-0 p-2">{tab}</h6> */}

      <div
        id="iXBRL"
        className={tab === "iXBRL Tags" ? "overflow-auto" : "d-none"}
        style={{ height: "calc(100% - 53px)" }}
      >
        <IXBRLTags
          {...{ openModal, setOpenModal }}
          {...{ editorInstance, fn, setFn, xbrlId, setXbrlId, setValue, dt }}
        />
      </div>
      <div
        id="Taxonomy"
        className={tab === "Taxonomy Viewer" ? "overflow-auto" : "d-none"}
        style={{ height: "calc(100% - 53px)" }}
      >
        <TaxonomyViewer {...{ dt }} />
      </div>
      <div
        id="Management"
        className={tab === "Management View" ? "overflow-auto" : "d-none"}
        style={{ height: "calc(100% - 53px)" }}
      >
        <ManagementView {...{ parentTags, setXbrlId, setTab }} />
      </div>
    </>
  );
}
