import { exclude } from "@/common/functions";

export const getProfile = (user: any, rmvArrs?: any) => {
  const { globalSuperAdmin, apexUsers, serviceProviderUsers: spUsers, clientUsers, ...rest } = user;
  const gData = { role: "SuperAdmin", permissions: null, clients: [], serviceProviders: [] };

  const data = globalSuperAdmin
    ? { ...gData, id: "", type: "apex" }
    : apexUsers.length > 0
    ? { ...apexUsers[0], type: "apex" }
    : spUsers.length > 0
    ? { ...spUsers[0], type: "serviceProvider" }
    : clientUsers.length > 0
    ? { ...clientUsers[0], type: "client" }
    : { id: "", role: "", permissions: null };

  const { id, type, role, permissions, ...rst } = data;
  const details = { name: "Apex", ...rst[type], [`userId`]: id, type };

  if (globalSuperAdmin) details["id"] = 1;

  if (details?.clients)
    details["clients"] = role === "SuperAdmin" ? details["clients"].map((el) => el.id) : [];

  if (details?.serviceProviders)
    details["serviceProviders"] =
      role === "SuperAdmin" ? details["serviceProviders"].map((el) => el.id) : [];

  const profile = rmvArrs ? exclude(details, ["clients", "serviceProviders"]) : { ...details };

  return { ...rest, profile, role, permissions, globalSuperAdmin };
};
