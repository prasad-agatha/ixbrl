import { useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import Select from "react-select";

import { selectStyle } from "@/common/functions";
import { options } from "@/db/constants";

export default function AddServiceProvider({ user, modal, setModal, onSubmit }) {
  const [errors, setErrors] = useState<any>({});
  const fields = [
    { lb: "ServiceProvider Name", vl: "name", req: true },
    { lb: "Super Admin Name", vl: "adminName", req: modal.type === "Add" },
    { lb: "Super Admin Email", vl: "email", req: modal.type === "Add" },
    { lb: "Apex", vl: "apexId", req: false },
    { lb: "Status", vl: "status", req: true },
  ];

  const hideField = (el) => {
    return (
      (modal.type === "Add" && ["Status"].includes(el.lb)) ||
      (modal.type === "Update" && ["Super Admin Name", "Super Admin Email"].includes(el.lb)) ||
      (el.lb === "Apex" && !user?.globalSuperAdmin)
    );
  };
  const roleOpts = (lb) => {
    if (lb === "Apex")
      return [
        { label: "Deselect", value: "" },
        { label: "Apex", value: "1" },
      ];

    return options(lb);
  };

  const handleSubmit = async () => {
    if (modal?.load) return;

    const err: any = {};
    fields.map((e) => {
      err[e.vl] =
        e.req && !modal.data[e.vl].trim()
          ? "This field is required"
          : e.req &&
            e.vl == "email" &&
            !new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}").test(modal.data[e.vl].trim())
          ? "Invalid Email"
          : "";
    });

    setErrors(err);
    if (Object.values(err).join().replaceAll(",", "")) return;

    onSubmit();
  };

  return (
    <Modal show={modal.show} centered backdrop="static" keyboard={false}>
      <Modal.Body>
        <div className="d-flex flex-column gap-2">
          <h5 className="fw-bold">{modal.type} ServiceProvider</h5>
          <div className="row px-2">
            {fields.map((el, id) => (
              <div className={hideField(el) ? "d-none" : "col-12 p-1 py-2"} key={id}>
                <label htmlFor={el.lb} className="form-label f-14 mb-1">
                  {el.lb}
                  <span className={!el.req ? "d-none" : "clr-danger"}> *</span>
                </label>

                {["Apex", "Status"].includes(el.lb) ? (
                  <Select
                    instanceId={`react-select-${el.lb}`}
                    classNamePrefix="select"
                    styles={selectStyle("16px", "38px")}
                    placeholder={`Select ${el.lb}`}
                    options={roleOpts(el.lb)}
                    value={
                      modal.data && modal.data[el.vl]
                        ? roleOpts(el.lb).find((ele) => ele.value === modal.data[el.vl])
                        : null
                    }
                    onChange={(e: any) => {
                      const data = { ...modal.data, [el.vl]: e.value };
                      setModal({ ...modal, data });
                    }}
                  />
                ) : (
                  <input
                    placeholder={`Enter ${el.lb}`}
                    type="text"
                    id={el.lb}
                    className="form-control"
                    disabled={modal.type !== "Add" && el.lb === "Email"}
                    value={(modal.data && modal.data[el.vl]) || ""}
                    onChange={(e) => {
                      setModal({ ...modal, data: { ...modal.data, [el.vl]: e.target.value } });
                      if (el.req && errors[el.vl]) setErrors({ ...errors, [el.vl]: "" });
                    }}
                  />
                )}

                <div className={el.req && errors[el.vl] ? "text-start" : "d-none"}>
                  <span className="rounded-1 clr-danger bg-danger f-10 p-1">{errors[el.vl]}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          <div className="w-100 text-end">
            <button
              className="btn f-14 px-5 me-2"
              onClick={() => setModal({ ...modal, show: false, type: "Add" })}
            >
              Cancel
            </button>
            <button className="btn btn-primary f-14 px-5" onClick={handleSubmit}>
              {modal?.load && <Spinner animation="border" className="me-2 sp-1" />}
              {modal.type}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
