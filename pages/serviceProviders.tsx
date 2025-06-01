import { useEffect, useState } from "react";
import Head from "next/head";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

import Layout from "@/layout";
import { customStyles, sortFunction, statusCol } from "@/common/tableFunctions";
import { hideNav } from "@/common/functions";

import ServiceProvidersPopover from "@/components/popover/ServiceProvidersPopover";
import AddServiceProvider from "@/components/modals/AddServiceProvider";
import { Spinner } from "@/components/loaders/Spinner";

import { useDebounce } from "@/hooks/useDebounce";

import ServiceProviderService from "@/services/serviceProvider.service";
import UserService from "@/services/user.service";

const userService = new UserService();
const sPService = new ServiceProviderService();

export default function ServiceProviders({ user, mutate, router }) {
  const { isReady } = router;
  const defaultData = { rst: false, ld: false, data: [], count: 0, pg: 1, pPg: 10 };
  const [modal, setModal] = useState<any>({ show: false, data: null, type: "Add" });
  const [dt, setDt] = useState<any>({ ...defaultData, ld: true });
  const [search, setSearch] = useState("");

  const err = (e) => {
    toast.error(e || "Error");
    setDt({ ...defaultData });
    mutate();
  };
  const debounceSearch = useDebounce(search, 500);
  useEffect(() => {
    const getServicesData = async () => {
      try {
        const services: any = await sPService.getServiceProviders(1, dt.pPg, debounceSearch, "");
        setDt({ ...dt, ...services, rst: false, ld: false, pg: 1 });
      } catch (e) {
        err(e);
      }
    };

    if (user && isReady && !hideNav("Service Providers", user)) getServicesData();
    if (user && isReady && hideNav("Service Providers", user)) router.push("/dashboard");
  }, [user, isReady, debounceSearch]);

  const handlePageChange = async (pg: any) => {
    if (!dt.rst) {
      try {
        const services: any = await sPService.getServiceProviders(pg, dt.pPg, debounceSearch, "");
        setDt({ ...dt, ...services, ld: false, pg });
      } catch (e) {
        err(e);
      }
    }
  };

  const handlePerRowsChange = async (pPg: any, pg: any) => {
    try {
      const services: any = await sPService.getServiceProviders(pg, pPg, debounceSearch, "");
      setDt({ ...dt, ...services, ld: false, pg, pPg });
    } catch (e) {
      err(e);
    }
  };

  const addServiceProvider = () => {
    const defaultServiceProvider = { name: "", adminName: "", email: "", status: "Active" };
    setModal({ show: true, data: { ...defaultServiceProvider, apexId: "1" }, type: "Add" });
  };

  const onSubmit = async () => {
    setModal({ ...modal, load: true });
    try {
      const data = { ...modal.data };
      data["apexId"] = data["apexId"] ? 1 : null;
      if (modal.type === "Add") {
        const serviceProvider = await sPService.createServiceProvider(data);
        const userData = {
          name: data.adminName,
          role: "SuperAdmin",
          email: data.email,
          type: "serviceProvider",
          serviceProviderId: serviceProvider.id,
        };
        await userService.createUser(userData);
      } else await sPService.updateServiceProvider(data.id, data);
      setModal({ ...modal, show: false, load: false });
      await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
      setModal({ ...modal, load: false });
    }
  };

  const onDelete = async (row) => {
    try {
      await sPService.deleteServiceProvider(row.id);
      await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
    }
  };

  const serviceProvidersColumns: any = [
    {
      name: "ServiceProvider Name",
      selector: (row) => <span title={row.name}>{row.name}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "name"),
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Super Admin Name",
      selector: (row) => (
        <span title={(row.users[0] || {})?.user?.name || ""}>
          {(row.users[0] || {})?.user?.name || ""}
        </span>
      ),
      minWidth: "150px",
      grow: 1,
    },
    {
      name: "Super Admin Email",
      selector: (row) => (
        <span title={(row.users[0] || {})?.user?.email || ""}>
          {(row.users[0] || {})?.user?.email || ""}
        </span>
      ),
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Status",
      selector: (row) => statusCol(row),
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "status"),
      minWidth: "150px",
      grow: 1,
    },
    {
      name: "No. of active users",
      selector: (row) => (
        <span title={row?._count?.users} className={row?._count?.users ? "" : "clr-danger"}>
          {row?._count?.users} Users
        </span>
      ),

      width: "150px",
    },
    {
      name: "Options",
      selector: (row) => <ServiceProvidersPopover {...{ user, setModal, row, onDelete }} />,
      minWidth: "85px",
      maxWidth: "85px",
      center: true,
    },
  ];

  return (
    <>
      <Head>
        <title>APEX iXBRL - Service Providers</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        <div className="container py-3">
          <div className="card p-3">
            <div className="flex-between">
              <h5 className="fw-600 m-0">Service Providers</h5>
              <div className="ms-auto">
                <input
                  className="w-100 border rounded f-12 search-input"
                  placeholder="Search Name"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDt({ ...dt, rst: true });
                  }}
                />
              </div>
              <button
                className={
                  user?.role === "SuperAdmin" && user?.profile?.type === "apex"
                    ? "btn btn-primary ms-3 f-12"
                    : "d-none"
                }
                onClick={addServiceProvider}
              >
                <img src="/icons/plus.svg" alt="-" width={15} height={15} />
                Add ServiceProvider
              </button>
            </div>

            <DataTable
              responsive
              customStyles={customStyles}
              className="table-height mt-2"
              columns={serviceProvidersColumns}
              data={dt.data}
              progressPending={dt.ld}
              progressComponent={
                <div className="flex-grow-1 h-100">
                  <Spinner />
                </div>
              }
              fixedHeader
              persistTableHead
              highlightOnHover
              pointerOnHover
              pagination
              paginationServer
              paginationTotalRows={dt.count}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              paginationResetDefaultPage={dt.rst}
            />
          </div>
        </div>
        {modal.show && <AddServiceProvider {...{ user, modal, setModal, onSubmit }} />}
      </Layout>
    </>
  );
}
