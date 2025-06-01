import { selectStyle } from "@/common/functions";
import { Modal } from "react-bootstrap";
import Select, { components, DropdownIndicatorProps } from "react-select";

export default function MergeFiles({ modal, setModal, merge }) {
  const DropdownIndicator = (props: DropdownIndicatorProps) => {
    return (
      <components.DropdownIndicator {...props}>
        <img alt="-" src="/icons/arrow-down.svg" />
      </components.DropdownIndicator>
    );
  };
  return (
    <Modal show={modal.show} centered backdrop="static" keyboard={false}>
      <Modal.Body>
        <div className="flex-center flex-column gap-2">
          <h5 className="text-center w-100 fw-bold py-2 m-0">Merge Your Files</h5>
          <hr className="w-100 m-0" />

          <div className="w-100">
            <label className="color-light f-12">File Name</label>
            <Select
              classNamePrefix="select"
              instanceId="react-select-file"
              components={{ DropdownIndicator }}
              styles={selectStyle("12px", "32px")}
              placeholder={"Select File"}
              options={[]}
              value={null}
              //   onChange={(e: any) => selectQ(e, id, idx)}
            />
          </div>
          {[
            { split: "Q2 File Cover", status: "completed" },
            {
              split: "Q2 File Table of Contents",
              status: "completed",
            },
            { split: "Q2 File Table", status: "completed" },
          ].map((e, id) => (
            <div className="flex-between gap-3 w-100" key={id}>
              <div className="flex-grow-1">
                {!id && <label className="color-light f-12">Split Files</label>}
                <Select
                  classNamePrefix="select"
                  instanceId="react-select-file"
                  components={{ DropdownIndicator }}
                  styles={selectStyle("12px", "32px")}
                  placeholder={"Select File"}
                  options={[{ label: e.split, value: e }]}
                  value={{ label: e.split, value: e }}
                  //   onChange={(e: any) => selectQ(e, id, idx)}
                />
              </div>
              <div>
                {!id && <label className="color-light f-12">Status</label>}
                <div
                  className="border rounded-1 flex-between gap-2 f-12 px-2"
                  style={{ height: "32px" }}
                >
                  Completed
                  <img alt="-" src="/icons/tick.svg" />
                </div>
              </div>
            </div>
          ))}
          <hr className="w-100 m-0 my-2" />
          <div className="w-100 text-end">
            <button
              className="btn f-14 px-4 me-2"
              onClick={() => setModal({ ...modal, show: false })}
            >
              Cancel
            </button>
            <button className="btn btn-primary f-14 px-4" onClick={merge}>
              Merge
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
