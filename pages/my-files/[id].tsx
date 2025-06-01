import { useEffect, useState } from "react";
import Head from "next/head";
import { Dropdown } from "react-bootstrap";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";

import Layout from "@/layout";
import {
  allowedCtrlKeys,
  allowedKeys,
  btns,
  editorStyle,
  fns,
  getElements,
  hasPermission,
  htmlData,
} from "@/common/functions";
import EditorSidebar from "@/components/sidebar/EditorSidebar";
import { Spinner } from "@/components/loaders/Spinner";

import FileService from "@/services/file.service";

const fileService = new FileService();

export default function MyFile({ user, mutate, router }) {
  const { isReady } = router;
  const { id } = router.query;

  const [editorInstance, setEditorInstance] = useState<any>({});
  // const [ty, setTy] = useState("iXBRL Tags");
  const [dt, setDt] = useState<any>({ ld: true });
  const [openModal, setOpenModal] = useState<any>(false);
  const [value, setValue] = useState<any>("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const file = await fileService.getFile(Number(id));

        if (!file.extra?.url && !file?.url) {
          toast.error("File not found");
          router.push("/my-files");
        }
        const vl = await htmlData(file);
        setValue(vl);
        setDt({ ...file, ld: false });
      } catch (e) {
        toast.error(e || "Error");
        router.push("/my-files");
      }
    };

    if (isReady && hasPermission(user, "edit") && Number(id)) fetchData();
    if (isReady && user && (!hasPermission(user, "edit") || !Number(id))) router.push("/my-files");
  }, [isReady, user, id]);

  const [select, setSelect] = useState("");
  const [tab, setTab] = useState("Management View");
  const [fn, setFn] = useState("");
  const [toggle, setToggle] = useState(true);
  const [parentTags, setParentTags] = useState([]);
  const [xbrlId, setXbrlId] = useState("");

  const navRow = (arr, dvd) => {
    return arr.map((e, id) => (
      <div className="d-flex" key={id}>
        {e.ty == "drp" ? (
          <Dropdown className="file-nav-dropdown">
            <Dropdown.Toggle id="dropdown-basic">
              <img alt="-" src={`/file/${e.lb}.svg`} />
              {e.lb} <img alt="-" src={`/icons/down-arrow.svg`} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {e.ops.map((el, idx) => (
                <Dropdown.Item eventKey={idx} onClick={el.clk} key={id}>
                  {el.lb}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <button
            className={`file-nav-button btn ${e?.cls || ""}`}
            onClick={() => {
              if (dvd) {
                setFn(e.lb);
                setTab("iXBRL Tags");
                setOpenModal(true);
              }
            }}
            disabled={["Inline Fact", "Inline Label"].includes(e.lb) && !select ? true : false}
          >
            <img alt="-" src={`/file/${e.lb}.svg`} />
            {e.lb}
          </button>
        )}
        {dvd && <span className={arr.length - 1 == id ? "d-none" : "color-light"}>|</span>}
      </div>
    ));
  };

  //  eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleEditorClick = (content, editor) => {
  const handleEditorClick = () => {
    const selectText = editorInstance.selection.getContent();
    setSelect(selectText);
    setFn("");
    const selectedNode: any = editorInstance?.selection?.getNode();
    if (selectedNode) {
      const hasXbrlId = (selectedNode?.getAttribute("id") || "").includes("xdx_")
        ? selectedNode.getAttribute("id")
        : "";
      setXbrlId(hasXbrlId);

      const pTags = [];
      let parentNode = selectedNode;

      while (parentNode && parentNode.nodeName !== "BODY") {
        pTags.push({ ...getElements(parentNode) });
        parentNode = parentNode.parentNode;
      }

      setParentTags(pTags.reverse());
    }
  };

  return (
    <>
      <Head>
        <title>APEX iXBRL - My Files</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        {dt.ld ? (
          <div className="flex-grow-1 h-100">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="bg-layout pb-2">
              <div className="container flex-lg-nowrap file-container">
                <h6 className="f-ellipsis fw-600 m-0" style={{ lineHeight: "20px" }}>
                  {dt.fileName}
                </h6>
                <div className="ms-auto"></div>
                {navRow(btns(), false)}
              </div>
              {/* TODO */}
              {/* <div className="container flex-lg-nowrap file-container">
            {["iXBRL Tags", "Text"].map((e, id) => (
              <span className={ty == e ? "fw-bold cr-p" : "cr-p"} onClick={() => setTy(e)} key={id}>
                {e}
              </span>
            ))}
          </div> */}
              <div className="container bg-body file-container items">{navRow(fns(), true)}</div>
            </div>

            <div className="container editor-section-container d-flex flex-grow-1 gap-3 p-3">
              <div className="editor-section">
                <Editor
                  id="FIXED_ID"
                  tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                  value={value}
                  init={{
                    height: "100%",
                    menubar: false,
                    plugins: [],
                    toolbar: [],
                    convert_fonts_to_spans: false,
                    convert_newlines_to_brs: false,
                    convert_urls: false,
                    image_caption: false,
                    pagebreak_split_block: false,
                    readonly: true,
                    placeholder: "",
                    extended_valid_elements: "span[*],font[*]",
                    content_style: editorStyle(),
                    setup: function (editor: any) {
                      setEditorInstance(editor);

                      editor.on("contextmenu", (e) => {
                        e.preventDefault();
                      });
                      editor.on("PastePreProcess", (e) => {
                        e.preventDefault();
                      });
                      editor.on("keydown", (e) => {
                        const cond =
                          allowedKeys.includes(e.key) ||
                          ((e.shiftKey || e.ctrlKey) && allowedCtrlKeys.includes(e.key));

                        if (!cond) e.preventDefault();
                      });
                    },
                  }}
                  onClick={handleEditorClick}
                />
              </div>

              <div className="editor-section-sidebar">
                <div className={toggle ? "flex-center" : "ms-auto my-auto"}>
                  <img
                    alt="-"
                    src={`/icons/${toggle ? "compress" : "expand"}.svg`}
                    width="16"
                    height="100"
                    onClick={() => setToggle(!toggle)}
                  />
                </div>
                <div style={{ width: "400px" }} className={toggle ? "bg-layout" : "d-none"}>
                  <EditorSidebar
                    {...{ fn, dt, setFn, parentTags, tab, setTab }}
                    {...{ xbrlId, setXbrlId, openModal, setOpenModal, editorInstance, setValue }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
}
