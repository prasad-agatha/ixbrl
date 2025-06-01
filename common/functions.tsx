export const editorStyle = () => {
  return `
*[id*="xdx_"] {
--corner-size: 0.375em;
--border-width: 0.25em;
--border-color: #209CFC;
position: relative;
padding: 0.1em 0.25em 0 0.25em;
}

*[id*="xdx_"]::before,
*[id*="xdx_"]::after {
content: "";
position: absolute;
width:var(--corner-size);
height:var(--corner-size);
border:var(--border-width) solid var(--border-color);
}

*[id*="xdx_"]::before {
left: 0;
top: 0;
border-bottom:none;
border-right:none;
}
    
*[id*="xdx_"]::after{
bottom: -1px;
right: 0;
border-left:none;
border-top:none;
}`;
};

export const selectStyle = (font: any, height: any) => {
  return {
    control: (provided, state) => ({
      ...provided,
      background: "#fff",
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      minHeight: "32px",
      fontSize: font,
      boxShadow: state.isFocused ? null : null,
      ":hover": {
        borderColor: "var(--primary)",
      },
    }),

    valueContainer: (provided) => ({
      ...provided,
      maxHeight: height,
      fontSize: font,
      padding: "0 6px",
    }),

    input: (provided) => ({
      ...provided,
      margin: "0px",
      fontSize: font,
    }),

    placeholder: (provided: any) => ({
      ...provided,
      position: "center",
      transform: "none",
      color: "var(--color-light) !important",
    }),

    menu: (base: any) => ({
      ...base,
      fontSize: font,
      margin: "0 !important",
    }),
    menuList: (base: any) => ({
      ...base,
      padding: "0 !important",
    }),

    option: (base: any) => ({
      ...base,
      color: "#212529",
      backgroundColor: "white",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "var(--hover)",
      },
    }),

    indicatorSeparator: (state) => ({
      display: "none",
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      maxHeight: height,
    }),
  };
};

export const exclude = (data, keys) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !keys.includes(key)));

export const include = (obj, keys) =>
  Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]));

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getLabel = (label = "") => {
  return label
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
    .join(" ");
};

export const userPermissionLabels = (lb) => {
  if (lb === "assign") return "Assign Files";
  if (lb === "upload") return "Upload Files";
  if (lb === "edit") return "Edit Files";
  if (lb === "delete") return "Delete Files";
  if (lb === "generate") return "Generate iXBRL";
  if (lb === "download") return "Download Package";
  if (lb === "update") return "Update Taxonomy";
  if (lb === "split") return "Split Files";
  return "";
};

export const hasPermission = (user, lb) => {
  return (
    user?.globalSuperAdmin ||
    ["SuperAdmin", "Admin"].includes(user?.role) ||
    (user?.permissions && user.permissions[lb]) ||
    false
  );
};

export const dateFormat = (date) => {
  return date
    ? new Date(date)
        .toLocaleString("default", {
          dateStyle: "long",
          timeStyle: "short",
          hour12: true,
        })
        .replace("at", "|")
    : "-";
};

export const hideNav = (lb, user) => {
  let hide = false;
  if (
    ["Users", "Service Providers", "Clients"].includes(lb) &&
    (!user?.role || user?.role === "User")
  )
    hide = true;
  if (
    lb === "Service Providers" &&
    (!user?.profile ||
      user?.profile.type === "client" ||
      (user?.role === "Admin" && user?.profile.type === "apex"))
  )
    hide = true;

  if (
    lb === "Clients" &&
    (!user?.profile ||
      (user?.role === "Admin" && ["apex", "serviceProvider"].includes(user?.profile.type)))
  )
    hide = true;

  return hide;
};

export const btns = () => [
  { lb: "Clear Auto-Tagging", ty: "btn" },
  { lb: "Settings", ty: "btn" },
  { lb: "Split", ty: "drp", ops: [{ lb: "Add Split" }, { lb: "Share Files" }] },
  { lb: "Validate", ty: "btn" },
  { lb: "Preview", ty: "drp", ops: [{ lb: "XBRL Preview" }, { lb: "iXBRL Preview" }] },
  { lb: "Submit", cls: "btn-mprimary", ty: "btn" },
  { lb: "Create iXBRL", cls: "btn-primary", ty: "btn" },
];

export const fns = () => [
  { lb: "Inline Fact", ty: "btn" },
  { lb: "Inline Label", ty: "btn" },
  { lb: "Block Fact", ty: "btn" },
  {
    lb: "Row Element",
    ty: "drp",
    ops: [{ lb: "Row with Element" }, { lb: "Row with Context" }, { lb: "Row with Date" }],
  },
  {
    lb: "Column Context",
    ty: "drp",
    ops: [
      { lb: "Column with Element" },
      { lb: "Column with Context" },
      { lb: "Column with Dimension" },
    ],
  },
  { lb: "Level 1", ty: "btn" },
  { lb: "Level 2", ty: "btn" },
  { lb: "Level 3", ty: "btn" },
  { lb: "Mark As Table", ty: "btn" },
  {
    lb: "Calculation",
    ty: "drp",
    ops: [{ lb: "Create Calculation" }, { lb: "Calculation Editor" }],
  },
  { lb: "Footnotes", ty: "drp", ops: [] },
  { lb: "Tools", ty: "drp", ops: [] },
  { lb: "Search", cls: "bg-layout rounded-pill ms-2 px-2", ty: "input" },
];

export const tagNames = (nodeName) => {
  if (nodeName === "BODY") return "BODY:Body of Document";
  if (nodeName === "DIV") return "DIV (block)";
  if (nodeName === "P") return "P - Paragraph (block)";
  if (nodeName === "STRONG") return "STRONG (inline)";
  if (nodeName === "SPAN") return "SPAN (inline)";
  if (nodeName === "B") return "B - Bold (inline)";
  if (nodeName === "FONT") return "FONT (inline)";
  return nodeName;
};

export const pickProperties = (tag) => {
  const data = { ["XBRL XDX Type"]: tag["XBRL XDX Type"] };
  if (tag["Element"]) data["Element"] = tag["Element"];
  if (tag["Indent"]) data["Indenting"] = tag["Indent"];
  if (tag["P"]) data["Precision"] = tag["P"];
  if (tag["Display"]) data["Display"] = tag["Display"];
  if (tag["Unit"]) data["Unit"] = tag["Unit"];
  if (tag["References"]) data["Footnotes"] = tag["References"];
  if (tag["Context"]) data["Context"] = tag["Context"];
  if (tag["uniqueId"]) data["UniqueId"] = tag["uniqueId"];
  if (tag["id"]) data["id"] = tag["id"];

  return data;
};

export const getElements = (parentNode) => {
  const styles = parentNode.getAttribute("style") || "";
  const xdx = parentNode.getAttribute("id") || "";
  const xdx_title = parentNode.getAttribute("title") || "";

  const properties = [];
  const styleObj = {};
  styles.split(";").forEach((part) => {
    const [lb, vl] = part.trim().split(":");
    if (lb && vl) {
      const val = getLabel(vl || "");
      if (lb === "font") {
        const values = val.split("pt") || [];
        properties.push({ lb: "Font Name", val: values[1] || "" });
        properties.push({ lb: "Font Size", val: (values[0] || "0") + "pt" });
      } else if (lb === "text-align") {
        properties.push({ lb: "Align", val });
      } else if (lb.includes("margin")) {
        styleObj[lb.trim()] = val.trim();
      } else if (lb === "text-decoration") {
        properties.push({ lb: "Decoration", val });
      } else {
        properties.push({ lb: getLabel(lb), val });
      }
    }
  });

  if (styleObj["margin-top"] || styleObj["margin-bottom"])
    properties.push({
      lb: "Margin T/B",
      val: `${styleObj["margin-top"] || ""} ${styleObj["margin-bottom"] || ""}`,
    });

  if (xdx.includes("xdx_")) {
    properties.push({ lb: "XBRL XDX Type", val: pickProperties(parseId(xdx)) });
    if (xdx_title) properties.push({ lb: "Title", val: xdx_title });
    properties.push({ lb: "ID", val: xdx });
  }

  return { title: tagNames(parentNode.nodeName), properties };
};

export const htmlData = async (file) => {
  const url = file.extra?.url || file.url;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const htmlData = new TextDecoder("ISO-8859-1").decode(buffer);

  return htmlData;
};

export const generateContext = (selectedValues) => {
  let context = "";
  if (selectedValues["Date"]) context += "_c" + selectedValues["Date"].replaceAll("-", "");

  if (selectedValues["Type"] === "duration" && selectedValues["End Date"])
    context += "__" + selectedValues["End Date"].replaceAll("-", "");

  if (selectedValues["Dimension"]?.length > 0)
    selectedValues["Dimension"].map(
      (e, id) =>
        (context +=
          "__" + e.replace(":", "--") + "__" + selectedValues["Member"][id].replace(":", "--"))
    );
  return context;
};

export const generateId = (fn, selectedValues, tag) => {
  let newId = "xdx_" + tagCode(fn, "lb") + randomLetter();

  if (selectedValues["Element"])
    newId += "_e" + selectedValues["Element"]["name"].replace(":", "--");

  const indents = ["Indenting", "Negated", "Heading", "Total Line"];
  const indent = [
    { lb: "Indenting", vl: "Indenting" },
    { lb: "Negated", vl: "N" },
    { lb: "Heading", vl: "B" },
    { lb: "Total Line", vl: "T" },
  ];

  if (Object.keys({ ...include(selectedValues, indents) }).length > 0)
    newId +=
      "_i" +
      indent
        .map((e) =>
          e.lb === "Indenting" ? selectedValues[e.vl] || "" : selectedValues[e.lb] ? e.vl : ""
        )
        .join("");

  if (selectedValues["Precision"] || selectedValues["Counted As"])
    newId += "_p" + (selectedValues["Precision"] || "d") + (selectedValues["Counted As"] || "d");

  if (selectedValues["Negated"]) newId += "_di";

  if (selectedValues["Unit"]) newId += "_u" + selectedValues["Unit"];

  if (selectedValues["References"])
    newId += "_f" + Buffer.from(selectedValues["References"]).toString("hex");

  newId += generateContext(selectedValues);

  newId += "_" + tag.uniqueId;

  return newId;
};

export const parseContext = (ctxt) => {
  const result: any = { Date: "", "End Date": "", Dimension: [], Member: [] };
  const contextParts = ctxt.split("_");
  const getCDate = (dte) =>
    dte.substring(0, 4) + "-" + dte.substring(4, 6) + "-" + dte.substring(6, 8);
  if (Number(contextParts[0])) {
    result.Date = getCDate(contextParts[0]);
    result.Type = "instant";
    contextParts.shift();
  }
  if (contextParts.length > 0 && Number(contextParts[0])) {
    result["End Date"] = getCDate(contextParts[0]);
    result.Type = "duration";
    contextParts.shift();
  }

  for (let j = 0; j < contextParts.length; j++) {
    const contextPart = contextParts[j];
    if (j % 2 === 0) result.Dimension = [...result.Dimension, contextPart.replace(":", "--")];
    else result.Member = [...result.Member, contextPart.replace(":", "--")];
  }
  return result;
};

export const parseId = (id: any) => {
  const parts = id.split(/(?<!_)_(?!_)/);

  let result: any = { id, Dimension: [], Member: [] };

  if (parts.length > 2 && parts[1].length === 3) {
    const typ = tagCode(parts[1].substring(0, 2), "vl");
    if (typ) result["XBRL XDX Type"] = typ;
  }

  for (let i = 2; i < parts.length - 1; i++) {
    const part = parts[i];

    if (part.charAt(0) === "e") result.Element = part.replace("--", ":").substring(1);
    else if (part.charAt(0) === "i") {
      result.Indent = part.slice(1);
      if (part.charAt(1) === "0") result.Indenting = part.slice(1, 3);
      if (part.includes("N")) result.Negated = true;
      if (part.includes("B")) result.Heading = true;
      if (part.includes("T")) result["Total Line"] = true;
    } else if (part.charAt(0) === "p") {
      result.P = part.slice(1);
      result.Precision = ["d", "i"].includes(part.charAt(1)) ? part.charAt(1) : part.slice(1, 3);
      result["Counted As"] = part.replace("p" + result.Precision, "");
    } else if (part.charAt(0) === "d") result.Display = part.substring(1);
    else if (part.charAt(0) === "u") result.Unit = part.substring(1);
    else if (part.charAt(0) === "f")
      result.References = Buffer.from(part.substring(1), "hex").toString();
    else if (part.charAt(0) === "c") {
      result.Context = part.replaceAll("__", "_").substring(1);
      const data = parseContext(result.Context);
      result = { ...result, ...data };
    } else result[part.charAt(0)] = part.substring(1);
  }

  result["uniqueId"] = parts[parts.length - 1];

  return result;
};

export const randomLetter = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomIndex = Math.floor(Math.random() * letters.length);
  return letters[randomIndex];
};

export const tagsArray = [
  { lb: "Inline Fact", vl: "90" },
  { lb: "Inline Label", vl: "91" },
  { lb: "Block Fact", vl: "98" },
];

export const tagCode = (fn, typ) => {
  const opp = (ty) => (ty === "lb" ? "vl" : "lb");
  return (tagsArray.find((e) => e[typ] == fn) || { lb: "", vl: "" })[opp(typ)];
};

export const allowedKeys = [
  "Control",
  "Shift",
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "ArrowRight",
  "ArrowLeft",
];

export const allowedCtrlKeys = [
  "c",
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "ArrowRight",
  "ArrowLeft",
];
