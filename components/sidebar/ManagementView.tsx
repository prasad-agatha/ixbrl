import { getLabel } from "@/common/functions";

export default function ManagementView({ parentTags, setXbrlId, setTab }) {
  const record = (el: any, idx: any, bl?: any) => {
    return (
      <div className="d-flex align-items-center text-black" key={idx}>
        <div className="w-100px f-12 f-ellipsis ps-3" title={el.lb}>
          {bl && idx > 1 ? <span>&nbsp;&nbsp;{">>"}&nbsp;&nbsp;</span> : ""}
          {getLabel(el.lb)}
        </div>
        <div className="flex-center f-12 f-ellipsis">
          &nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
          <div
            className={"f-12 f-ellipsis" + (bl && el.lb === "XBRL XDX Type" ? " f-underline " : "")}
            title={el.val}
            onClick={() => {
              if (bl && el.lb === "XBRL XDX Type") {
                setXbrlId(bl?.id);
                setTab("iXBRL Tags");
              }
            }}
          >
            {el.val}
          </div>
        </div>
      </div>
    );
  };
  const tags = (e) => (
    <>
      <p className="mv-title f-ellipsis mt-3 mb-2">{e.title}</p>
      {e.properties.map((el, idx) => (
        <>
          {el.lb === "XBRL XDX Type" ? (
            <>
              {Object.entries(el.val || {}).map(([lb, val], id) =>
                lb === "id" ? <></> : record({ lb, val }, id, el.val)
              )}
            </>
          ) : (
            record(el, idx)
          )}
        </>
      ))}
    </>
  );

  return (
    <div className="p-3 px-2 f-14">
      <p className="bg-body rounded-1 fw-bold f-ellipsis px-2 py-1">File/Document Information</p>
      {tags({
        title: "Name:Xbrldocs tokencom.ftp",
        properties: [
          { lb: "DTD", val: "EDGAR HTML 3.2 Hybrid" },
          { lb: "Code Pos", val: "28 : 38" },
        ],
      })}

      <div className="mb-3"></div>
      <p className="bg-body rounded-1 fw-bold f-ellipsis px-2 py-1">HTML Elements/Style</p>

      {parentTags.map((e, id) => (
        <div key={id}>{tags(e)}</div>
      ))}
    </div>
  );
}
