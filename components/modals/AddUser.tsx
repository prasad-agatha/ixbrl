import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";

import { exclude, getLabel, selectStyle, userPermissionLabels } from "@/common/functions";
import { options, userPermissions } from "@/db/constants";

import ClientService from "@/services/client.service";
import ServiceProviderService from "@/services/serviceProvider.service";

const clientService = new ClientService();
const sPService = new ServiceProviderService();

export default function AddUser({ user, modal, setModal, onSubmit }) {
  const [entities, setEntities] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const fields = [
    { lb: "Full Name", vl: "name", req: true },
    { lb: "Management Role", vl: "role", req: true },
    { lb: "Email", vl: "email", req: true },
    { lb: "Phone Number", vl: "phoneNumber", req: false },
    { lb: "Role", vl: "type", req: true },
    { lb: "Client", vl: "apexId", req: true },
    { lb: "Status", vl: "status", req: true },
  ];

  useEffect(() => {
    const getEntitiesData = async () => {
      try {
        const clients: any = await clientService.getClients(1, 10, "");
        const serviceProviders: any = await sPService.getServiceProviders(1, 10, "", "");
        setEntities({
          clients: clients.data.map((e) => {
            return { label: e.name, value: e.id };
          }),
          serviceProviders: serviceProviders.data.map((e) => {
            return { label: e.name, value: e.id };
          }),
        });
      } catch (e: any) {
        toast.error(e || "Error");
      }
    };
    getEntitiesData();
  }, []);

  const hideField = (el) => {
    return (
      (modal.data.globalSuperAdmin &&
        ["Management Role", "Role", "Client", "Status"].includes(el.lb)) ||
      (modal.type === "Add" && el.lb === "Status") ||
      (el.lb === "Client" && modal.data.type === "apex") ||
      (user?.role === "Admin" && ["Role", "Client"].includes(el.lb))
    );
  };
  const roleOpts = (lb) => {
    if (lb === "Role") {
      if (user?.profile?.type === "client") return [options(lb)[2]];
      if (user?.profile?.type === "serviceProvider") return [options(lb)[1], options(lb)[2]];
    } else if (lb === "Management Role") {
      if (user?.role === "Admin" && modal.data?.id === user?.id)
        return [options(lb)[1], options(lb)[2]];
      if (user?.role === "Admin") return [options(lb)[2]];
    }
    return options(lb);
  };

  const handleSubmit = async () => {
    if (modal?.load) return;

    const err: any = {};
    fields.map((e) => {
      if (e.lb !== "Client")
        err[e.vl] =
          e.req && !modal.data[e.vl].trim()
            ? "This field is required"
            : e.vl == "email" &&
              !new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}").test(modal.data[e.vl].trim())
            ? "Invalid Email"
            : "";
    });
    err["apexId"] = modal.data[`${modal.data.type}Id`] ? "" : "This field is required";

    setErrors(err);
    if (Object.values(err).join().replaceAll(",", "")) return;

    onSubmit();
  };

  return (
    <Modal show={modal.show} centered backdrop="static" keyboard={false}>
      <Modal.Body>
        <div className="d-flex flex-column gap-2">
          <h5 className="fw-bold">{modal.type} User</h5>
          <div className="row px-2">
            {fields.map((el, id) => (
              <div className={hideField(el) ? "d-none" : "col-12 col-md-6 p-1 py-2"} key={id}>
                <label htmlFor={el.lb} className="form-label f-14 mb-1">
                  {el.lb === "Client" ? getLabel(modal.data.type) : el.lb}
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
                ) : ["Management Role", "Role", "Status"].includes(el.lb) ? (
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
                      const rest: any = exclude(modal.data, [
                        "apexId",
                        "clientId",
                        "serviceProviderId",
                      ]);
                      let data = {};
                      data[el.vl] = e.value;
                      if (el.lb == "Management Role" && e.value !== "User")
                        data = {
                          ...modal.data,
                          ...data,
                          permissions: { ...rest.permissions, ...userPermissions() },
                        };
                      else if (el.lb === "Role")
                        data = {
                          ...rest,
                          ...data,
                          [`${e.value}Id`]: e.value === "apex" ? { label: "Apex", value: 1 } : null,
                        };
                      else data = { ...modal.data, ...data };
                      setModal({ ...modal, data });
                    }}
                  />
                ) : el.lb === "Client" ? (
                  <AsyncSelect
                    instanceId="react-select-member"
                    styles={selectStyle("16px", "38px")}
                    placeholder={`Search ${getLabel(modal.data.type)}`}
                    defaultOptions={(entities && entities[`${modal.data.type}s`]) || []}
                    loadOptions={(value) => {
                      if (modal.data.type === "client")
                        return clientService.getClients(1, 10, value).then((res) => {
                          return res.data.map((e) => {
                            return { label: e.name, value: e.id };
                          });
                        });
                      else
                        return sPService.getServiceProviders(1, 10, value, "").then((res) => {
                          return res.data.map((e) => {
                            return { label: e.name, value: e.id };
                          });
                        });
                    }}
                    value={
                      modal.data.type === "client"
                        ? modal.data?.clientId
                        : modal.data?.serviceProviderId
                    }
                    onChange={(event: any) => {
                      setModal({
                        ...modal,
                        data: { ...modal.data, [`${modal.data.type}Id`]: event },
                      });
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

          {modal.data.role === "User" && (
            <>
              <hr className="m-0 mb-2" />
              <div className="d-flex flex-nowrap">
                <div className="f-ellipsis">Permissions</div>
                <div className="text-center ms-auto" style={{ minWidth: "50px" }}>
                  Yes
                </div>
                <div className="text-center" style={{ minWidth: "50px" }}>
                  No
                </div>
              </div>
              {/*  eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {Object.entries(modal.data.permissions).map(([k, v], id) => (
                <div className="d-flex flex-nowrap" key={id}>
                  <div className="f-14 f-ellipsis ps-2">{userPermissionLabels(k)}</div>
                  <div className="text-center ms-auto" style={{ minWidth: "50px" }}>
                    <input
                      type="radio"
                      name={k}
                      checked={modal.data.permissions[k]}
                      onChange={() => {
                        const data = { ...modal.data };
                        const { permissions } = data;
                        permissions[k] = true;
                        setModal({ ...modal, data });
                      }}
                    />
                  </div>
                  <div className="text-center" style={{ minWidth: "50px" }}>
                    <input
                      type="radio"
                      name={k}
                      checked={!modal.data.permissions[k]}
                      onChange={() => {
                        const data = { ...modal.data };
                        const { permissions } = data;
                        permissions[k] = false;
                        setModal({ ...modal, data });
                      }}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

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
