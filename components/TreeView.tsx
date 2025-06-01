import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const Popover = ({ x, y, cn, na, treeToggle }) => {
  const copy = (txt: any) => {
    navigator.clipboard.writeText(txt);
    toast.success("Element Copied!");
  };
  return (
    <div className="bg-layout border rounded-1 absolute" style={{ left: x + "px", top: y + "px" }}>
      <div className={na ? "popover-item border-bottom p-1" : "d-none"} onClick={() => copy(na)}>
        Copy Element
      </div>
      <div className="popover-item border-bottom p-1" onClick={() => treeToggle(cn, true)}>
        Expand subtree
      </div>
      <div className="popover-item p-1" onClick={() => treeToggle(cn, false)}>
        Collapse subtree
      </div>
    </div>
  );
};

const TreeNode = (props) => {
  const { toggle, setToggle, popoverPosition, setPopoverPosition } = props;
  const { setPrevious, elementId, setElementId, handleContextMenu } = props;
  const { lb, ic, nd, cn } = props.ele;

  const treeToggle = (cn: any, bl?: any) => {
    setPopoverPosition(null);
    setPrevious(true);
    setToggle((pT) => {
      return {
        ...pT,
        [cn]: bl !== undefined ? bl : toggle && toggle[cn] ? !toggle[cn] : true,
      };
    });
  };

  return (
    <React.Fragment key={cn}>
      <div
        className={"network-browser-item" + (elementId === cn ? " active" : "")}
        id={cn}
        title={lb}
        onContextMenu={(e) => handleContextMenu(e, cn, props.ele?.na)}
        onMouseDown={(e) => {
          if (e.detail > 1) e.preventDefault();
        }}
        onDoubleClick={() => treeToggle(cn)}
        onClick={() => {
          if (!props.ele?.ic?.includes("group")) setElementId(cn);
          treeToggle(cn);
        }}
      >
        {cn.split("-").map((e, id) => (
          <div className={id > 0 ? "line" : "d-none"} key={id}>
            {e ? "" : ""}
          </div>
        ))}
        {popoverPosition && <Popover {...{ ...popoverPosition, treeToggle }} />}

        <div className="" style={{ minWidth: "12px" }}>
          {nd && nd.length > 0 && (
            <img
              alt="-"
              onClick={(e) => {
                e.stopPropagation();
                treeToggle(cn);
              }}
              className="expand"
              src={`/icons/${toggle && toggle[cn] ? "subtract" : "add"}.svg`}
            />
          )}
        </div>
        {ic && <img alt="-" src={`/icons/${ic}.svg`} />}
        {lb}
      </div>
      {nd && toggle && toggle[cn] && (
        <>
          {nd.map((ele) => (
            <React.Fragment key={ele.cn}>
              <TreeNode
                {...{ toggle, setToggle, popoverPosition, setPopoverPosition }}
                {...{ ele, setPrevious, elementId, setElementId, handleContextMenu }}
              />
            </React.Fragment>
          ))}
        </>
      )}
    </React.Fragment>
  );
};

const TreeView = ({ url, element, elementId, setElementId }) => {
  const [loading, setLoading] = useState(true);
  const [previous, setPrevious] = useState(false);
  const [toggle, setToggle] = useState<any>(null);
  const [treeData, setTreeData] = useState([]);
  const [popoverPosition, setPopoverPosition] = useState<any>(null);

  const handleContextMenu = (e, cn, na) => {
    e.preventDefault();
    setPopoverPosition({ x: e.clientX, y: e.clientY, cn, na });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setToggle(null);
        setLoading(true);
        const response = await fetch(url);
        const xmlData = await response.json();
        setTreeData(xmlData);
        setLoading(false);
      } catch (e) {
        toast.error(e || "Error loading Taxonomy");
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  useEffect(() => {
    if (element) {
      const tag = document.getElementById(element.cn);
      const container = document.getElementById("network-browser");

      if (tag && container) container.scrollTop = tag.offsetTop - container.offsetTop - 25;
    }
  }, [element]);

  useEffect(() => {
    const getToggle = (cn) => {
      const substrings = cn.split("-");
      return substrings.reduce((result, _, index) => {
        const key = substrings.slice(0, index + 1).join("-");
        result[key] = true;
        return result;
      }, {});
    };

    if (elementId)
      setToggle(previous ? { ...toggle, ...getToggle(elementId) } : getToggle(elementId));
    setPrevious(false);
  }, [elementId]);

  return (
    <>
      {loading && (
        <div className="flex-center h-100">
          <Spinner animation="border" className="sp-1" />
        </div>
      )}
      {treeData.map((ele) => (
        <React.Fragment key={ele.cn}>
          <TreeNode
            {...{ toggle, setToggle, popoverPosition, setPopoverPosition }}
            {...{ ele, setPrevious, elementId, setElementId, handleContextMenu }}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default TreeView;
