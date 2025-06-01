import { getLabel, include, selectStyle } from "@/common/functions";
import { options } from "@/db/constants";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";

export default function Unit({ setDt, modal, setModal, setFormErrors }) {
  const [errors, setErrors] = useState<any>({});
  const fields = [
    { lb: "Preset", vl: "preset", req: true },
    { lb: "Name", vl: "name", req: true },
    { lb: "Numerator", vl: "numerator", req: true },
    { lb: "Denominator", vl: "denominator", req: false },
    { lb: "Default For", vl: "defaultFor", req: false },
  ];

  const handleSubmit = async () => {
    if (modal?.load) return;

    const err: any = {};
    fields.map((e) => {
      err[e.vl] =
        e.req && !(Object.values(include(modal.data || {}, [e.vl]))[0] || "").trim()
          ? "This field is required"
          : "";
    });

    setErrors(err);
    if (Object.values(err).join().replaceAll(",", "")) return;

    setDt((pD) => {
      return { ...pD, unit: [...pD.unit, { ...modal.data }] };
    });
    setFormErrors((pE) => {
      return { ...pE, unit: "" };
    });
    setModal({ ...modal, show: false });
  };

  const getOption = (el) => {
    const opt = [];
    options(el.lb).map((option) =>
      option.options.map((op) => {
        if (op.value === (Object.values(include(modal.data || {}, [el.vl]))[0] || "")) opt.push(op);
      })
    );
    return opt.length > 0 ? opt[0] : null;
  };
  return (
    <Modal show={modal.show} centered backdrop="static" keyboard={false}>
      <Modal.Body>
        <div className="flex-center flex-column gap-2">
          <div className="flex-between w-100">
            <label className="form-label fw-bold m-0">
              Unit<span className="clr-danger"> *</span>
            </label>
            <label className="flex-center d-inline-flex gap-1">
              <input
                name="unit"
                type="checkbox"
                className=""
                checked={modal.data?.customUnit}
                onChange={() =>
                  setModal({
                    ...modal,
                    data: { ...modal.data, customUnit: !modal.data?.customUnit },
                  })
                }
              />
              <p className="f-12 m-0">Custom Unit</p>
            </label>
          </div>

          <div className="row px-2">
            {fields.map((el, id) => (
              <div className={"col-12 col-md-6 p-1 py-2" + (id > 1 ? " col-lg-4" : "")} key={id}>
                <label htmlFor={el.lb} className="form-label mb-1">
                  {getLabel(el.lb)}
                  {el.req && <span className="clr-danger"> *</span>}
                </label>

                {id !== 1 ? (
                  <Select
                    instanceId={`react-select-${el.lb}`}
                    classNamePrefix="select"
                    styles={selectStyle("16px", "38px")}
                    placeholder={`${el.lb}`}
                    options={options(el.lb)}
                    value={
                      ["Numerator", "Denominator"].includes(el.lb)
                        ? getOption(el)
                        : options(el.lb).find(
                            (option) =>
                              option.value ===
                              (Object.values(include(modal.data || {}, [el.vl]))[0] || "")
                          ) || null
                    }
                    onChange={(e) => {
                      const data = { ...modal.data };
                      data[el.vl] = e.value;
                      if (
                        el.lb === "Numerator" &&
                        !(Object.values(include(data || {}, ["name"]))[0] || "")
                      ) {
                        data["name"] = e.value;
                      }

                      setModal({ ...modal, data });
                      if (el.req && errors[el.vl])
                        setErrors({
                          ...errors,
                          [el.vl]: "",
                          name: data?.name ? "" : errors?.name || "",
                        });
                    }}
                  />
                ) : (
                  <input
                    placeholder={`Enter ${el.lb}`}
                    type="text"
                    id={el.lb}
                    className="form-control"
                    value={Object.values(include(modal.data || {}, [el.vl]))[0] || ""}
                    onChange={(e) => {
                      setModal({
                        ...modal,
                        data: { ...modal.data, [el.vl]: e.target.value },
                      });
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
          <div className="w-100 text-end">
            <button
              className="btn f-14 px-5 me-2"
              onClick={() => setModal({ ...modal, show: false })}
            >
              Cancel
            </button>
            <button className="btn btn-primary f-14 px-5" onClick={handleSubmit}>
              Add
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
