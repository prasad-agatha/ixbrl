import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Spinner } from "react-bootstrap";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";

import Layout from "@/layout";
import { getLabel, hasPermission, selectStyle } from "@/common/functions";
import FileDrop from "@/components/dropzone/FIleDrop";
import Unit from "@/components/modals/Unit";
import { options } from "@/db/constants";

import UserService from "@/services/user.service";
import FileService from "@/services/file.service";
import TaxonomyService from "@/services/taxonomy.service";

const userService = new UserService();
const fileService = new FileService();
const taxonomyService = new TaxonomyService();

export default function NewFile({ user, mutate, router }) {
  const { isReady } = router;

  const default1 = { files: "html", tagging: "Manual Tagging", companyName: "", ticker: "" };
  const default2 = { cik: "", companyWebsite: "", formType: "", period: "", taxonomyId: "" };
  const default3 = { periodFrom: "", periodTo: "", url: "", unit: [], assigned: "" };
  const defaultData = { ...default1, ...default2, ...default3, status: "Pending" };

  const [dt, setDt] = useState<any>({ ...defaultData, ld: false });
  const [modal, setModal] = useState({ show: false, data: null });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [entities, setEntities] = useState<any>({ users: [], taxonomies: [] });

  const fields = [
    { lb: "Company Name", vl: "companyName", req: true },
    { lb: "Ticker", vl: "ticker", req: true },
    { lb: "CIK", vl: "cik", req: true },
    { lb: "Company Website", vl: "companyWebsite", req: true },
    { lb: "Form Type", vl: "formType", req: true },
    { lb: "Period", vl: "period", req: true },
    { lb: "Select Taxonomy", vl: "taxonomyId", req: true },
    { lb: "Report Period", vl: "reportPeriod", req: true },
  ];
  useEffect(() => {
    const getEntitiesData = async () => {
      try {
        setDt({ ...dt, assigned: { label: user.email, value: user.id } });

        const users: any = [{ label: user.email, value: user.id }];
        if (hasPermission(user, "assign")) {
          const data = await userService.getUsers(1, 10, "", "edit");

          data.data.map((e) => {
            if (e.email !== user.email) users.push({ label: e.email, value: e.id });
          });
        }
        const data = await taxonomyService.getTaxonomies();
        const taxonomies = data.map((e) => {
          return { label: getLabel(e.name), value: e.id };
        });

        setEntities({ users: [...users], taxonomies });
      } catch (e: any) {
        toast.error(e || "Error");
      }
    };
    if (user && isReady && hasPermission(user, "upload")) getEntitiesData();

    if (user && isReady && !hasPermission(user, "upload")) router.push("/my-files");
  }, [user, isReady]);

  const handleSubmit = async () => {
    const err: any = {};
    fields.map((e) => {
      err[e.vl] =
        e.vl !== "reportPeriod" && e.req && !(dt[e.vl].toString() || "").trim()
          ? "This field is required"
          : "";
    });

    if (!dt.periodFrom || !dt.periodTo) err["reportPeriod"] = "This field is required";
    if (dt.unit.length === 0) err["unit"] = "This field is required";
    if (!uploadedFile) err["url"] = "Upload File";

    setErrors(err);
    if (Object.values(err).join().replaceAll(",", "")) return;

    try {
      setDt({ ...dt, ld: true });
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("name", "uploadedFile");
      const fileUpload = await fileService.s3upload(formData);
      const url = fileUpload.url;

      const data = { ...dt, url };
      const name = dt["periodFrom"].replaceAll("-", "") + "__" + dt["periodTo"].replaceAll("-", "");
      data["assigned"] = dt["assigned"]["value"];
      data["period"] = dt["period"] + "T00:00:00Z";
      data["periodFrom"] = dt["periodFrom"] + "T00:00:00Z";
      data["periodTo"] = dt["periodTo"] + "T00:00:00Z";
      data["tagging"] = dt["tagging"].includes("Manual") ? "Manual" : "Auto";

      const secondResponse = await fileService.uploadFile(data);
      const fileId = secondResponse.id;
      await fileService.createContext(fileId, { name: dt["period"].replaceAll("-", "") });
      await fileService.createContext(fileId, { name });

      router.push(`/my-files/${fileId}`);
    } catch (e) {
      toast.error(e || "Error");
    }
    setDt({ ...dt, ld: false });
  };

  const selectOptions = (lb) => {
    if (lb === "Form Type") return [{ label: "10-K", value: "10-K" }];
    else if (lb === "Select Taxonomy") return entities.taxonomies;
    else return [];
  };

  return (
    <>
      <Head>
        <title>APEX iXBRL - New File</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        <div className="container py-3">
          <h5 className="fw-600 mb-3">New File</h5>

          <div className="card p-3">
            <div className="row px-2">
              {fields.map((el, id) => (
                <div
                  className={"col-12 col-md-6 col-lg-4 p-1 py-2" + (id > 5 ? " col-lg-6" : "")}
                  key={id}
                >
                  <label htmlFor={el.lb} className="form-label f-14 mb-1">
                    {el.lb}
                    <span className={!el.req ? "d-none" : "clr-danger"}> *</span>
                  </label>

                  {el.lb === "Period" ? (
                    <input
                      type="date"
                      placeholder="Enter "
                      value={dt[el.vl] || ""}
                      onChange={(e) => {
                        setDt({ ...dt, [el.vl]: e.target.value });
                        if (el.req && errors[el.vl]) setErrors({ ...errors, [el.vl]: "" });
                      }}
                      className="form-control"
                    />
                  ) : el.lb === "Report Period" ? (
                    <div className="d-flex gap-2">
                      <input
                        type="date"
                        placeholder="Enter "
                        value={dt?.periodFrom || ""}
                        onChange={(e) => {
                          setDt({ ...dt, periodFrom: e.target.value });
                          if (el.req && errors[el.vl] && dt.periodTo)
                            setErrors({ ...errors, [el.vl]: "" });
                        }}
                        className="form-control"
                      />
                      <input
                        type="date"
                        placeholder="Enter "
                        value={dt?.periodTo || ""}
                        onChange={(e) => {
                          setDt({ ...dt, periodTo: e.target.value });
                          if (el.req && errors[el.vl] && dt.periodFrom)
                            setErrors({ ...errors, [el.vl]: "" });
                        }}
                        className="form-control"
                      />
                    </div>
                  ) : id > 3 ? (
                    <Select
                      instanceId={`react-select-${el.vl}`}
                      classNamePrefix="select"
                      styles={selectStyle("16px", "38px")}
                      placeholder={`Select ${el.lb}`}
                      options={selectOptions(el.lb)}
                      value={
                        dt[el.vl]
                          ? selectOptions(el.lb).find((option) => option.value === dt[el.vl])
                          : null
                      }
                      onChange={(e) => {
                        setDt({ ...dt, [el.vl]: e.value });
                        if (el.req && errors[el.vl]) setErrors({ ...errors, [el.vl]: "" });
                      }}
                    />
                  ) : (
                    <input
                      placeholder={id == 1 ? el.lb : id == 2 ? `${el.lb} Number` : `Add ${el.lb}`}
                      type="text"
                      className="form-control"
                      value={dt[el.vl]}
                      onChange={(e) => {
                        setDt({ ...dt, [el.vl]: e.target.value });
                        if (el.req && errors[el.vl]) setErrors({ ...errors, [el.vl]: "" });
                      }}
                    />
                  )}

                  <div className={el.req && errors[el.vl] ? "text-start" : "d-none"}>
                    <span className="rounded-1 clr-danger bg-danger f-10 p-1">{errors[el.vl]}</span>
                  </div>
                </div>
              ))}

              <div className="col-12 col-md-6 d-flex flex-column p-1 py-2">
                <div className="flex-between mb-1 pb-3">
                  <label className="form-label mb-1">
                    Unit<span className="clr-danger"> *</span>
                  </label>
                  <button
                    className="btn btn-outline-primary f-12 fw-500 py-1"
                    onClick={() => setModal({ show: true, data: { customUnit: false } })}
                  >
                    Add Unit
                  </button>
                </div>

                <div className="bg-body flex-between unit-table">
                  <div className="f-ellipsis">Name</div>
                  <div className="f-ellipsis">Value</div>
                  <div className="f-ellipsis">Default For</div>
                  <div></div>
                </div>

                <div className="overflow-auto mb-3" style={{ height: "100px" }}>
                  {dt.unit.map((e, id) => (
                    <div className="border-top flex-between unit-table" key={id}>
                      <div className="f-ellipsis" title={e.name}>
                        {e.name}
                      </div>
                      <div className="f-ellipsis" title={e.preset}>
                        {e.preset}
                      </div>
                      <div className="f-ellipsis" title={e.defaultFor}>
                        {e.defaultFor}
                      </div>
                      <div>
                        <img
                          src="/icons/cross.svg"
                          alt="-"
                          className="cr-p"
                          onClick={() => {
                            const tmp = [...dt.unit];
                            tmp.splice(id, 1);
                            setDt({ ...dt, unit: tmp });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {errors["unit"] && (
                  <div className="">
                    <span className="rounded-1 clr-danger bg-danger f-10 p-1">
                      {errors["unit"]}
                    </span>
                  </div>
                )}
                <div className="mt-auto mb-3">
                  <label className="w-100 mb-1">
                    Tagging Options<span className="clr-danger"> *</span>
                  </label>
                  <div className="d-flex gap-3">
                    {["Manual Tagging", "AI Powered Auto-Tagging"].map((e, id) => (
                      <label
                        className="flex-center d-inline-flex gap-1"
                        key={id}
                        onClick={() => setDt({ ...dt, tagging: e })}
                      >
                        <input
                          name="tagging"
                          type="radio"
                          className=""
                          checked={e === dt.tagging}
                          readOnly
                        />
                        <p className="m-0">{e}</p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6 p-1 py-2">
                <label className="form-label">
                  Upload your files<span className="clr-danger"> *</span>
                </label>
                <div className="">
                  <div className="flex-center d-inline-flex f-14 files-tabs pt-1">
                    <div
                      className={dt.files === "html" ? "active" : "color-light"}
                      onClick={() => setDt({ ...dt, files: "html" })}
                    >
                      Add HTML
                    </div>
                    <span className="color-light">|</span>
                    <div
                      className={dt.files === "zip" ? "active" : "color-light"}
                      // onClick={() => setFiles("zip")}
                    >
                      Add iXBRL Zip
                    </div>
                  </div>
                </div>
                <div className="bg-body rounded mx-2 p-4">
                  <FileDrop {...{ setErrors }} onFileSelect={(file) => setUploadedFile(file)} />
                </div>
                {errors["url"] && (
                  <span className="rounded-1 clr-danger bg-danger f-10 p-1">{errors["url"]}</span>
                )}
              </div>

              <div className="col-12 col-md-6 col-lg-4 p-1 py-2">
                <label htmlFor="assigned" className="form-label mb-1">
                  Assigned to:
                </label>
                <AsyncSelect
                  instanceId="react-select-assign"
                  styles={selectStyle("16px", "38px")}
                  placeholder={`Search Users`}
                  defaultOptions={entities.users}
                  loadOptions={(value) => {
                    const users: any = [{ label: user.email, value: user.id }];
                    if (hasPermission(user, "assign")) {
                      return userService.getUsers(1, 10, value, "edit").then((res) => {
                        res.data.map((e) => {
                          if (e.email !== user.email) users.push({ label: e.email, value: e.id });
                        });
                        return [...users];
                      });
                    } else
                      return new Promise((resolve) => setTimeout(() => resolve([...users]), 1));
                  }}
                  value={dt.assigned}
                  menuPlacement="top"
                  onChange={(event: any) => setDt({ ...dt, assigned: event })}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4 p-1 py-2">
                <label htmlFor="status" className="form-label mb-1">
                  Status
                </label>
                <Select
                  instanceId={`react-select-status`}
                  classNamePrefix="select"
                  styles={selectStyle("16px", "38px")}
                  placeholder={`Select Status`}
                  options={options("File Status")}
                  value={
                    dt["status"]
                      ? options("File Status").find((option) => option.value === dt["status"])
                      : null
                  }
                  onChange={(e) => {
                    setDt({ ...dt, ["status"]: e.value });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="w-100 text-end mt-3">
            <Link href="/my-files" className="btn btn-outline-primary f-14 fw-600 px-4 me-2">
              Cancel
            </Link>

            <button className="btn btn-primary f-14 fw-600 px-4" onClick={handleSubmit}>
              {dt.ld && <Spinner animation="border" className="me-2 sp-1" />}
              Continue
            </button>
          </div>
        </div>

        {modal.show && <Unit {...{ setDt, modal, setModal }} setFormErrors={setErrors} />}
      </Layout>
    </>
  );
}
