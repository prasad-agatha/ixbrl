import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";

import { selectStyle } from "@/common/functions";
import { options } from "@/db/constants";

import ServiceProviderService from "@/services/serviceProvider.service";

const sPService = new ServiceProviderService();

export default function AddClient({ user, modal, setModal, onSubmit }) {
  const [entities, setEntities] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  const fields = [
    { lb: "Client Name", vl: "name", req: true },
    { lb: "Website", vl: "website", req: true },
    { lb: "Super Admin Name", vl: "adminName", req: modal.type === "Add" },
    { lb: "Super Admin Email", vl: "email", req: modal.type === "Add" },
    { lb: "Phone Number", vl: "phoneNumber", req: true },
    { lb: "Apex", vl: "apexId", req: false },
    { lb: "ServiceProvider", vl: "serviceProviderId", req: false },
    { lb: "Status", vl: "status", req: true },
  ];

  useEffect(() => {
    const getEntitiesData = async () => {
      try {
        const apex = modal.data.apexId ? "true" : "false";
        const serviceProviders: any = await sPService.getServiceProviders(1, 10, "", apex);
        setEntities([
          { label: "Deselect", value: null, field: null },
          ...serviceProviders.data.map((e) => {
            return { label: e.name, value: e.id, field: e.apexId };
          }),
        ]);
      } catch (e: any) {
        toast.error(e || "Error");
      }
    };
    getEntitiesData();
  }, [modal.data.apexId]);

  const hideField = (el) => {
    return (
      (modal.type === "Add" && ["Status"].includes(el.lb)) ||
      (modal.type === "Update" && ["Super Admin Name", "Super Admin Email"].includes(el.lb)) ||
      (el.lb === "Apex" && !user?.globalSuperAdmin) ||
      (el.lb === "ServiceProvider" && user?.profile?.type !== "apex")
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
          <h5 className="fw-bold">{modal.type} Client</h5>
          <div className="row px-2">
            {fields.map((el, id) => (
              <div className={hideField(el) ? "d-none" : "col-12 p-1 py-2"} key={id}>
                <label htmlFor={el.lb} className="form-label f-14 mb-1">
                  {el.lb}
                  <span className={!el.req ? "d-none" : "clr-danger"}> *</span>
                </label>

                {el.lb === "Phone Number" ? (
                  <PhoneInput
                    inputClass="react-tel-input"
                    country={"us"}
                    value={(modal.data && modal.data[el.vl]) || ""}
                    onChange={(e) => {
                      setModal({ ...modal, data: { ...modal.data, [el.vl]: e } });
                      if (el.req && errors[el.vl]) setErrors({ ...errors, [el.vl]: "" });
                    }}
                  />
                ) : ["Apex", "Status"].includes(el.lb) ? (
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
                      if (el.lb === "Apex") data["serviceProviderId"] = null;

                      setModal({ ...modal, data });
                    }}
                  />
                ) : el.lb === "ServiceProvider" ? (
                  <AsyncSelect
                    instanceId="react-select-serviceProvider"
                    styles={selectStyle("16px", "38px")}
                    placeholder={`Search ServiceProviders`}
                    defaultOptions={entities}
                    loadOptions={(value) => {
                      return sPService.getServiceProviders(1, 10, value, "").then((res) => {
                        return [{ label: "Deselect", value: null, field: null }, ...res.data].map(
                          (e) => {
                            return { label: e.name, value: e.id, field: e.apexId };
                          }
                        );
                      });
                    }}
                    value={modal.data.serviceProviderId}
                    onChange={(event: any) => {
                      const data = { ...modal.data };
                      if (event.label === "Deselect") data[el.vl] = null;
                      else {
                        data[el.vl] = event;
                        data["apexId"] = event.field;
                      }
                      setModal({ ...modal, data });
                      if (el.req && errors[el.vl]) setErrors({ ...errors, [el.vl]: "" });
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

// import { Modal } from "react-bootstrap";
// import { useState } from "react";
// import PhoneInput from "react-phone-input-2";

// export default function AddClient({ modal, setModal }) {
//   const [tagging, setTagging] = useState("Manual Tagging");
//   const [phoneNumber, setPhoneNumber] = useState("");

//   const fields = ["Client Name", "Website", "Super Admin", "Super Admin Email", "Phone Number"];

//   return (
//     <Modal show={modal.show} centered backdrop="static" keyboard={false}>
//       <Modal.Body>
//         <div className="d-flex flex-column gap-2">
//           <h5 className="fw-bold">Add New Client</h5>
//           {fields.map((e, id) => (
//             <div key={id}>
//               <label htmlFor={e} className="form-label mb-1">
//                 {e}
//                 <span className="clr-danger"> *</span>
//               </label>
//               {id === fields.length - 1 ? (
//                 <PhoneInput
//                   inputClass="react-tel-inputs "
//                   country={"us"}
//                   value={phoneNumber}
//                   onChange={(phone) => setPhoneNumber(phone)}
//                 />
//               ) : (
//                 <input
//                   placeholder={
//                     id === 0 ? e : id === 1 ? `${e} URL` : id === 2 ? `${e} Name` : `Add ${e}`
//                   }
//                   type="text"
//                   id={e}
//                   className="form-control"
//                 />
//               )}
//             </div>
//           ))}
//           <div className="d-flex flex-row">
//             <div>
//               <label className="w-100 mb-1">
//                 Tagging Options<span className="clr-danger"> *</span> &#160;
//               </label>
//             </div>
//             <div>
//               <div className=" d-flex gap-3">
//                 {["Yes", "No"].map((e, id) => (
//                   <label
//                     className="flex-center d-inline-flex gap-1"
//                     key={id}
//                     onClick={() => setTagging(e)}
//                   >
//                     <input
//                       name="tagging"
//                       type="radio"
//                       className=""
//                       checked={e === tagging}
//                       readOnly
//                     />
//                     <p className="m-0">{e}</p>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//           <hr className="my-2" />
//           <div className="w-100 text-end">
//             <button
//               className="btn f-14 px-5 me-2"
//               onClick={() => setModal({ ...modal, show: false })}
//             >
//               Cancel
//             </button>
//             <button className="btn btn-primary f-14 fw-600 px-5">Add</button>
//           </div>
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// }
