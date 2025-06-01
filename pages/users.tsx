import { useEffect, useState } from "react";
import Head from "next/head";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

import Layout from "@/layout";
import { customStyles, sortFunction, statusCol } from "@/common/tableFunctions";
import { dateFormat, getLabel, hideNav } from "@/common/functions";

import AddUser from "@/components/modals/AddUser";
import UsersPopover from "@/components/popover/UsersPopover";
import { Spinner } from "@/components/loaders/Spinner";

import { userPermissions } from "@/db/constants";
import { useDebounce } from "@/hooks/useDebounce";

import UserService from "@/services/user.service";

const userService = new UserService();

export default function Users({ user, mutate, router }) {
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
  const debouncedSearchText = useDebounce(search, 500);
  useEffect(() => {
    const getUsersData = async () => {
      try {
        const users: any = await userService.getUsers(1, dt.pPg, debouncedSearchText);
        setDt({ ...dt, ...users, rst: false, ld: false, pg: 1 });
      } catch (e) {
        err(e);
      }
    };

    if (user && isReady && !hideNav("Users", user)) getUsersData();
    if (user && isReady && hideNav("Users", user)) router.push("/dashboard");
  }, [user, isReady, debouncedSearchText]);

  const handlePageChange = async (pg: any) => {
    if (!dt.rst) {
      try {
        const users: any = await userService.getUsers(pg, dt.pPg, debouncedSearchText);
        setDt({ ...dt, ...users, ld: false, pg });
      } catch (e) {
        err(e);
      }
    }
  };

  const handlePerRowsChange = async (pPg: any, pg: any) => {
    try {
      const users: any = await userService.getUsers(pg, pPg, debouncedSearchText);
      setDt({ ...dt, ...users, ld: false, pg, pPg });
    } catch (e) {
      err(e);
    }
  };

  const addUser = () => {
    const defaultUser = {
      name: "",
      role: "User",
      email: "",
      phoneNumber: "",
      status: "Active",
      globalSuperAdmin: false,
      permissions: { ...userPermissions() },
    };
    const { id: value, name: label, type } = user.profile;
    const typeId = { label, value };
    setModal({
      show: true,
      data: { ...defaultUser, type, [`${type}Id`]: typeId },
      type: "Add",
    });
  };

  const onSubmit = async () => {
    setModal({ ...modal, load: true });
    try {
      const data = { ...modal.data };
      data[`${modal.data.type}Id`] = data[`${modal.data.type}Id`]["value"];
      if (modal.type === "Add") await userService.createUser(data);
      else await userService.updateUser(data.id, data);
      setModal({ ...modal, show: false, load: false });

      if (user.id === data.id) {
        setDt({ ...dt, rst: true });
        mutate();
      } else await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
      setModal({ ...modal, load: false });
    }
  };

  const onDelete = async (row) => {
    try {
      await userService.deleteUser(row.id);
      await handlePageChange(dt.pg);
    } catch (e) {
      toast.error(e || "Error");
    }
  };

  const usersColumns: any = [
    {
      name: "Name",
      selector: (row) => <span title={row.name}>{row.name}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "name"),
      minWidth: "150px",
      grow: 1,
    },
    {
      name: "Email",
      selector: (row) => <span title={row.email}>{row.email}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "email"),
      minWidth: "175px",
      grow: 1,
    },
    {
      name: "Role",
      selector: (row) => <span title={row.profile.type}>{getLabel(row.profile.type)}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "profile.type"),
      minWidth: "150px",
      grow: 1,
    },
    {
      name: "Management Role",
      selector: (row) => <span title={row.role}>{row.role}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "role"),
      minWidth: "150px",
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
      name: "Last Login",
      selector: (row) => <span title={dateFormat(row.lastLogin)}>{dateFormat(row.lastLogin)}</span>,
      sortable: true,
      sortFunction: (rA, rB) => sortFunction(rA, rB, "lastLogin"),
      width: "175px",
    },
    {
      name: "Options",
      selector: (row) =>
        user.role === "Admin" && (row.id === user.id ? false : row.role !== "User") ? (
          <></>
        ) : (
          <UsersPopover {...{ setModal, row, onDelete }} />
        ),
      minWidth: "85px",
      maxWidth: "85px",
      center: true,
    },
  ];

  return (
    <>
      <Head>
        <title>APEX iXBRL - All Users</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        <div className="container py-3">
          <div className="card p-3">
            <div className="flex-between">
              <h5 className="fw-600 m-0">All Users</h5>
              <div className="ms-auto">
                <input
                  className="w-100 border rounded f-12 search-input"
                  placeholder="Search Name or Email"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDt({ ...dt, rst: true });
                  }}
                />
              </div>
              <button
                className="btn btn-primary ms-3 f-12"
                disabled={!user?.profile?.type}
                onClick={addUser}
              >
                <img src="/icons/plus.svg" alt="-" width={15} height={15} />
                New User
              </button>
            </div>

            <DataTable
              responsive
              customStyles={customStyles}
              className="table-height mt-2"
              columns={usersColumns}
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
        {modal.show && <AddUser {...{ user, modal, setModal, onSubmit }} />}
      </Layout>
    </>
  );
}
