import { useEffect, useState } from "react";
import Head from "next/head";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

import Layout from "@/layout";
import { customStyles, sortFunction, statusCol } from "@/common/tableFunctions";
import { hideNav } from "@/common/functions";

import ClientsPopover from "@/components/popover/ClientPopover";
import AddClient from "@/components/modals/AddClient";
import { Spinner } from "@/components/loaders/Spinner";

import { useDebounce } from "@/hooks/useDebounce";

import ClientService from "@/services/client.service";
import UserService from "@/services/user.service";

const userService = new UserService();
const clientService = new ClientService();

export default function Clients({ user, mutate, router }) {
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
    const getClientsData = async () => {
      try {
        const clients: any = await clientService.getClients(1, dt.pPg, debounceSearch);
        setDt({ ...dt, ...clients, rst: false, ld: false, pg: 1 });
      } catch (e) {
        err(e);
      }
    };

    if (user && isReady && !hideNav("Clients", user)) getClientsData();
    if (user && isReady && hideNav("Clients", user)) router.push("/dashboard");
  }, [user, isReady, debounceSearch]);

  const handlePageChange = async (pg: any) => {
    if (!dt.rst) {
      try {
        const clients: any = await clientService.getClients(pg, dt.pPg, debounceSearch);
        setDt({ ...dt, ...clients, ld: false, pg });
      } catch (e) {
        err(e);
      }
    }
  };

  const handlePerRowsChange = async (pPg: any, pg: any) => {
    try {
      const clients: any = await clientService.getClients(pg, pPg, debounceSearch);
      setDt({ ...dt, ...clients, ld: false, pg, pPg });
    } catch (e) {
      err(e);
    }
  };

  const addClient = () => {
    const defaultClient = {
      name: "",
      website: "",
      adminName: "",
      email: "",
      phoneNumber: "",
      status: "Active",
      apexId: "",
      serviceProviderId: null,
    };
    const { type } = user.profile;
    if (type === "apex") defaultClient["apexId"] = "1";
    if (type === "serviceProvider") {
      const { apexId, id: value, name: label } = user.profile;
      defaultClient["apexId"] = apexId ? "1" : "";
      defaultClient["serviceProviderId"] = { label, value, field: apexId || null };
    }

    setModal({ show: true, data: { ...defaultClient }, type: "Add" });
  };

  const onSubmit = async () => {
    setModal({ ...modal, load: true });
    try {
      const data = { ...modal.data };
      data["apexId"] = data["apexId"] ? 1 : null;
      data["serviceProviderId"] = data["serviceProviderId"]
        ? data["serviceProviderId"]["value"]
        : null;

      if (modal.type === "Add") {
        const client = await clientService.createClient(data);
        const userData = {
          name: data.adminName,
          role: "SuperAdmin",
          email: data.email,
          type: "client",
          clientId: client.id,
        };
        await userService.createUser(userData);
      } else await clientService.updateClient(data.id, data);
      setModal({ ...modal, show: false, load: false });
      await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
      setModal({ ...modal, load: false });
    }
  };

  const onDelete = async (row) => {
    try {
      await clientService.deleteClient(row.id);
      await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
    }
  };

  const clientsColumns: any = [
    {
      name: "Client Name",
      selector: (row) => <span title={row.name}>{row.name}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "name"),
      minWidth: "150px",
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
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Website",
      selector: (row) => <span title={row.website}>{row.website}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "website"),
      minWidth: "175px",
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
      selector: (row) => <ClientsPopover {...{ user, setModal, row, onDelete }} />,
      minWidth: "85px",
      maxWidth: "85px",
      center: true,
    },
  ];

  return (
    <>
      <Head>
        <title>APEX iXBRL - Clients</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        <div className="container py-3">
          <div className="card p-3">
            <div className="flex-between">
              <h5 className="fw-600 m-0">Clients</h5>
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
                  user?.role === "SuperAdmin" &&
                  ["apex", "serviceProvider"].includes(user?.profile?.type)
                    ? "btn btn-primary ms-3 f-12"
                    : "d-none"
                }
                onClick={addClient}
              >
                <img src="/icons/plus.svg" alt="-" width={15} height={15} />
                Add Client
              </button>
            </div>

            <DataTable
              responsive
              customStyles={customStyles}
              className="table-height mt-2"
              columns={clientsColumns}
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
        {modal.show && <AddClient {...{ user, modal, setModal, onSubmit }} />}
      </Layout>
    </>
  );
}
