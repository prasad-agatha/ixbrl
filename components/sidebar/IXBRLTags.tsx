import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

import { uploadToS3 } from "@/common/s3UploadData";
import { exclude, getLabel, parseId, pickProperties } from "@/common/functions";
import InlineFact from "@/components/tags/InlineFact";
import { Spinner } from "@/components/loaders/Spinner";

import FileService from "@/services/file.service";
import TaxonomyService from "@/services/taxonomy.service";

const taxonomyService = new TaxonomyService();
const fileService = new FileService();

export default function IXBRLTags(props) {
  const { openModal, setOpenModal, editorInstance, fn, setFn, xbrlId, setXbrlId, setValue, dt } =
    props;

  const fields = () => {
    return { id: "", Dimension: [], Member: [] };
  };

  const [edit, setEdit] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [render, setRender] = useState<any>(false);
  const [xbrl, setXBRL] = useState<any>({});
  const [title, setTitle] = useState<any>("");
  const [defaultValues, setDefaultValues] = useState<any>({ ...fields() });

  useEffect(() => {
    const getTagData = () => {
      try {
        const element = editorInstance.dom.select(`[id="${xbrlId}"]`);
        let node: any = null;
        let t: any = "";
        if (element.length > 0) node = element[0];
        if (node) t = node.getAttribute("title") || "";
        setTitle(t);
        setXBRL({ ...parseId(xbrlId), Label: t });
      } catch (e) {
        toast.error(e || "Error");
        setTitle("");
      }
    };
    setLoading(false);
    if (xbrlId) getTagData();
  }, [xbrlId, render]);

  useEffect(() => {
    const getElementData = async () => {
      try {
        setLoading(true);
        const data = { ...exclude(xbrl, ["Element", "End Date"]) };
        const name = xbrl.Element.split(":")[1];
        const searchData = await taxonomyService.searchFilterTaxonomy(dt.taxonomyId, { name });
        const elementId = (searchData.find((e) => e.name === name) || {})?.cn;
        if (elementId) {
          const elementData = await taxonomyService.searchTaxonomy(
            `${dt.taxonomyId}?file=Presentation&elementId=${elementId}`
          );
          if (elementData.length > 0) {
            data["Element"] = {
              cn: elementData[0].cn,
              name: elementData[0].name,
              label: elementData[0].label_x,
            };
            data["Data Type"] = elementData[0].dataType;
            data["Period"] = elementData[0].period;
            data["Type"] = elementData[0].period;
            data["Balance"] = elementData[0].balance;
            if (elementData[0].period === "duration" && xbrl) data["End Date"] = xbrl["End Date"];
            setDefaultValues({ ...data });
          } else setDefaultValues({ ...exclude(xbrl, ["Element"]) });
        } else setDefaultValues({ ...exclude(xbrl, ["Element"]) });

        setLoading(false);
      } catch (e) {
        setLoading(false);
        toast.error(e || "Error");
        setDefaultValues({ ...exclude(xbrl, ["Element"]) });
      }
    };

    if (xbrl?.Element && edit && typeof xbrl.Element === "string") getElementData();
  }, [xbrl, edit]);

  const record = (el: any, idx: any, bl?: any) => {
    return (
      <div className="d-flex align-items-center text-black" key={idx}>
        <div className="w-100px f-12 f-ellipsis ps-3" title={el.lb}>
          {bl && idx > 1 ? <span>&nbsp;&nbsp;{">>"}&nbsp;&nbsp;</span> : ""}
          {getLabel(el.lb)}
        </div>
        <div className="flex-center f-12 f-ellipsis">
          &nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;
          <div className="f-12 f-ellipsis" title={el.val}>
            {el.val}
          </div>
        </div>
      </div>
    );
  };

  const onDelete = async () => {
    try {
      const tagged = xbrl["XBRL XDX Type"];
      const element = editorInstance.dom.select(`[id="${xbrlId}"]`);
      let node: any = null;
      if (element.length > 0) node = element[0];
      if (!node) {
        toast.error("Tag not found");
        return;
      }
      if (tagged === "Block Fact") {
        const domElement = editorInstance.dom.getParent(node, "*");
        domElement.removeAttribute("id");
        domElement.removeAttribute("title");
      } else if (["Inline Fact", "Inline Label"].includes(tagged)) {
        const selectedNode = node;

        const parentNode = selectedNode.parentNode;
        if (parentNode) {
          while (selectedNode.firstChild) {
            parentNode.insertBefore(selectedNode.firstChild, selectedNode);
          }
          parentNode.removeChild(selectedNode);
        }
      }

      const htmlData = editorInstance.getContent();

      const urlSplits = dt.url.split("/");
      const urlName = urlSplits[urlSplits.length - 1];
      const key = urlName.split(".")[0] + "_1." + urlName.split(".")[1];
      const uploadedUrl = await uploadToS3(htmlData, key);

      await fileService.updateFile(dt.id, { ...dt, extra: { ...dt.extra, url: uploadedUrl } });

      setValue(htmlData);
      setEdit(false);
      setFn("");
      setXbrlId("");
    } catch (e) {
      toast.error(e);
    }
  };

  const onCopy = () => {
    //
  };

  return (
    <div>
      {fn || (xbrlId && edit) ? (
        loading ? (
          <div className="flex-grow-1 h-100">
            <Spinner />
          </div>
        ) : (
          <InlineFact
            {...{ editorInstance, fn, setFn, dt, setValue, setEdit, setXbrlId }}
            {...{ defaultValues, openModal, setOpenModal, setRender }}
          />
        )
      ) : !xbrlId ? (
        <div className="text-center mt-3">
          <Image alt="-" src="/icons/notTagged.svg" width={130} height={130} />
          <h4 className="color">Not Tagged Yet</h4>
          <h6 className="color-light f-10">Select the text and start tagging</h6>
        </div>
      ) : (
        <div className="p-3 px-2">
          <div className="flex-between mb-2">
            <div className="mv-title f-ellipsis m-0 ps-3" style={{ minWidth: "125px" }}>
              XBRL Element
            </div>
            <div className="flex-center gap-2" style={{ minWidth: "100px" }}>
              {["deletee", "pencil", "copy"].map((e, id) => (
                <Image
                  key={id}
                  alt=""
                  className="cr-p"
                  src={`/icons/${e}.svg`}
                  width={16}
                  height={16}
                  onClick={() => {
                    id === 0 ? onDelete() : id === 1 ? setEdit(true) : onCopy();
                  }}
                />
              ))}
            </div>
          </div>
          {Object.entries({ ...pickProperties(xbrl) }).map(([lb, val], id) =>
            lb === "id" ? <></> : record({ lb, val }, id, xbrl)
          )}
          {title && Object.entries({ title }).map(([lb, val], id) => record({ lb, val }, id, xbrl))}
          {Object.entries({ id: xbrl.id }).map(([lb, val], id) => record({ lb, val }, id, xbrl))}
        </div>
      )}
    </div>
  );
}
