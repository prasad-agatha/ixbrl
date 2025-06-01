export const userSelect = () => {
  return {
    id: true,
    email: true,
    name: true,
    lastLogin: true,
    phoneNumber: true,
    status: true,
    globalSuperAdmin: true,
    apexUsers: {
      select: {
        id: true,
        role: true,
        permissions: true,
        apex: {
          select: {
            id: true,
            serviceProviders: { select: { id: true } },
            clients: { select: { id: true } },
          },
        },
      },
    },
    serviceProviderUsers: {
      select: {
        id: true,
        role: true,
        permissions: true,
        serviceProvider: {
          select: { id: true, name: true, apexId: true, clients: { select: { id: true } } },
        },
      },
    },
    clientUsers: {
      select: {
        id: true,
        role: true,
        permissions: true,
        client: {
          select: { id: true, name: true },
        },
      },
    },
  };
  // return {
  //   id: true,
  //   email: true,
  //   name: true,
  //   lastLogin: true,
  //   phoneNumber: true,
  //   status: true,
  //   globalSuperAdmin: true,
  //   apexUsers: { select: { id: true, role: true, permissions: true, apexId: true } },
  //   serviceProviderUsers: {
  //     select: {
  //       id: true,
  //       role: true,
  //       permissions: true,
  //       serviceProvider: { select: { id: true, name: true, apexId: true } },
  //     },
  //   },
  //   clientUsers: {
  //     select: {
  //       id: true,
  //       role: true,
  //       permissions: true,
  //       client: {
  //         select: {
  //           id: true,
  //           name: true,
  //           apexId: true,
  //           serviceProvider: { select: { id: true, name: true } },
  //         },
  //       },
  //     },
  //   },
  // };
};
