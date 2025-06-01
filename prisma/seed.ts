import { PrismaClient, UserRole } from "@prisma/client";
const prisma = new PrismaClient();

const userPermissions = () => {
  return {
    assign: true,
    upload: true,
    edit: true,
    delete: true,
    generate: true,
    download: true,
    update: true,
    split: true,
  };
};

const users = [
  {
    name: "Global Super Admin",
    email: "globalsuperadmin@gmail.com",
    password: "$2b$10$xs3qbj.NLYRJ19TSswtoLeQ6FJmYvFxf8KG9vm7mfkEatrOO/zS2S",
    globalSuperAdmin: true,
  },
  {
    name: "Apex Super Admin",
    email: "apexsuperadmin@gmail.com",
    password: "$2b$10$xs3qbj.NLYRJ19TSswtoLeQ6FJmYvFxf8KG9vm7mfkEatrOO/zS2S",
    globalSuperAdmin: false,
  },
];
const types = [
  "a",
  "a_s1",
  "a_s2",
  "s1",
  "s2",
  "a_s1_c1",
  "a_s1_c2",
  "a_s2_c1",
  "a_s2_c2",
  "s1_c1",
  "s1_c2",
  "s2_c1",
  "s2_c2",
  "a_c1",
  "a_c2",
  "c1",
  "c2",
];
const serviceProvidersUsers = [
  { role: UserRole.SuperAdmin, userId: 7, serviceProviderId: 1 },
  { role: UserRole.Admin, userId: 8, serviceProviderId: 1 },
  { role: UserRole.User, userId: 9, serviceProviderId: 1 },
  { role: UserRole.User, userId: 10, serviceProviderId: 1 },

  { role: UserRole.SuperAdmin, userId: 11, serviceProviderId: 2 },
  { role: UserRole.Admin, userId: 12, serviceProviderId: 2 },
  { role: UserRole.User, userId: 13, serviceProviderId: 2 },
  { role: UserRole.User, userId: 14, serviceProviderId: 2 },

  { role: UserRole.SuperAdmin, userId: 15, serviceProviderId: 3 },
  { role: UserRole.Admin, userId: 16, serviceProviderId: 3 },
  { role: UserRole.User, userId: 17, serviceProviderId: 3 },
  { role: UserRole.User, userId: 18, serviceProviderId: 3 },

  { role: UserRole.SuperAdmin, userId: 19, serviceProviderId: 4 },
  { role: UserRole.Admin, userId: 20, serviceProviderId: 4 },
  { role: UserRole.User, userId: 21, serviceProviderId: 4 },
  { role: UserRole.User, userId: 22, serviceProviderId: 4 },
];
const apexs = [{ name: "apex" }];

const apexUsers = [
  {
    role: UserRole.SuperAdmin, // Use the enum value
    userId: 2,
    apexId: 1,
    permissions: { ...userPermissions() },
  },
];

const clients = [
  { name: "a_s1_c1", apexId: 1, serviceProviderId: 1 },
  { name: "a_s1_c2", apexId: 1, serviceProviderId: 1 },
  { name: "a_s2_c1", apexId: 1, serviceProviderId: 2 },
  { name: "a_s2_c2", apexId: 1, serviceProviderId: 2 },
  { name: "s1_c1", serviceProviderId: 3 },
  { name: "s1_c2", serviceProviderId: 3 },
  { name: "s2_c1", serviceProviderId: 4 },
  { name: "s2_c2", serviceProviderId: 4 },
  { name: "a_c1", apexId: 1 },
  { name: "a_c2", apexId: 1 },
  { name: "c1" },
  { name: "c2" },
];

const serviceProviders = [
  { name: "a_s1", apexId: 1 },
  { name: "a_s2", apexId: 1 },
  { name: "s1" },
  { name: "s2" },
];

const clientUsers = [
  { clientId: 1, userId: 23, role: UserRole.SuperAdmin },
  { clientId: 1, userId: 24, role: UserRole.Admin },
  { clientId: 1, userId: 25, role: UserRole.User },
  { clientId: 1, userId: 26, role: UserRole.User },

  { clientId: 2, userId: 27, role: UserRole.SuperAdmin },
  { clientId: 2, userId: 28, role: UserRole.Admin },
  { clientId: 2, userId: 29, role: UserRole.User },
  { clientId: 2, userId: 30, role: UserRole.User },

  { clientId: 3, userId: 31, role: UserRole.SuperAdmin },
  { clientId: 3, userId: 32, role: UserRole.Admin },
  { clientId: 3, userId: 33, role: UserRole.User },
  { clientId: 3, userId: 34, role: UserRole.User },

  { clientId: 4, userId: 35, role: UserRole.SuperAdmin },
  { clientId: 4, userId: 36, role: UserRole.Admin },
  { clientId: 4, userId: 37, role: UserRole.User },
  { clientId: 4, userId: 38, role: UserRole.User },

  { clientId: 5, userId: 39, role: UserRole.SuperAdmin },
  { clientId: 5, userId: 40, role: UserRole.Admin },
  { clientId: 5, userId: 41, role: UserRole.User },
  { clientId: 5, userId: 42, role: UserRole.User },

  { clientId: 6, userId: 43, role: UserRole.SuperAdmin },
  { clientId: 6, userId: 44, role: UserRole.Admin },
  { clientId: 6, userId: 45, role: UserRole.User },
  { clientId: 6, userId: 46, role: UserRole.User },

  { clientId: 7, userId: 47, role: UserRole.SuperAdmin },
  { clientId: 7, userId: 48, role: UserRole.Admin },
  { clientId: 7, userId: 49, role: UserRole.User },
  { clientId: 7, userId: 50, role: UserRole.User },

  { clientId: 8, userId: 51, role: UserRole.SuperAdmin },
  { clientId: 8, userId: 52, role: UserRole.Admin },
  { clientId: 8, userId: 53, role: UserRole.User },
  { clientId: 8, userId: 54, role: UserRole.User },

  { clientId: 9, userId: 55, role: UserRole.SuperAdmin },
  { clientId: 9, userId: 56, role: UserRole.Admin },
  { clientId: 9, userId: 57, role: UserRole.User },
  { clientId: 9, userId: 58, role: UserRole.User },

  { clientId: 10, userId: 59, role: UserRole.SuperAdmin },
  { clientId: 10, userId: 60, role: UserRole.Admin },
  { clientId: 10, userId: 61, role: UserRole.User },
  { clientId: 10, userId: 62, role: UserRole.User },

  { clientId: 11, userId: 63, role: UserRole.SuperAdmin },
  { clientId: 11, userId: 64, role: UserRole.Admin },
  { clientId: 11, userId: 65, role: UserRole.User },
  { clientId: 11, userId: 66, role: UserRole.User },

  { clientId: 12, userId: 67, role: UserRole.SuperAdmin },
  { clientId: 12, userId: 68, role: UserRole.Admin },
  { clientId: 12, userId: 69, role: UserRole.User },
  { clientId: 12, userId: 70, role: UserRole.User },
];

export const main = async () => {
  console.log(`Start seeding ...`);
  for (const i of users) {
    try {
      await prisma.user.create({ data: i });
    } catch {
      console.log("Error at: ", i);
    }
  }
  for (const i of types) {
    for (const u of ["_su", "_ad", "_u1", "_u2"]) {
      try {
        await prisma.user.create({
          data: {
            name: `${i}${u}`,
            email: `${i}${u}@g.com`,
            password: "$2b$10$xs3qbj.NLYRJ19TSswtoLeQ6FJmYvFxf8KG9vm7mfkEatrOO/zS2S",
            globalSuperAdmin: false,
          },
        });
      } catch {
        console.log("Error at: ", i);
      }
    }
  }

  for (const i of apexs) {
    try {
      await prisma.apex.create({ data: i });
    } catch {
      console.log("Error at: ", i);
    }
  }
  for (const i of apexUsers) {
    try {
      await prisma.apexUser.create({ data: i });
    } catch {
      console.log("Error at: ", i);
    }
  }
  for (const i of [3, 4, 5, 6]) {
    try {
      await prisma.apexUser.create({
        data: {
          userId: i,
          apexId: 1,
          role: i === 3 ? UserRole.SuperAdmin : i === 4 ? UserRole.Admin : UserRole.User,
          permissions: { ...userPermissions() },
        },
      });
    } catch {
      console.log("Error at: ", i);
    }
  }

  for (const i of serviceProviders) {
    try {
      await prisma.serviceProvider.create({ data: i });
    } catch {
      console.log("Error at: ", i);
    }
  }
  for (const i of serviceProvidersUsers) {
    try {
      await prisma.serviceProviderUser.create({
        data: { ...i, permissions: { ...userPermissions() } },
      });
    } catch {
      console.log("Error at: ", i);
    }
  }

  for (const i of clients) {
    try {
      await prisma.client.create({
        data: { ...i, website: `${i.name}@g.com`, phoneNumber: "919281" },
      });
    } catch {
      console.log("Error at: ", i);
    }
  }
  for (const i of clientUsers) {
    try {
      await prisma.clientUser.create({ data: { ...i, permissions: { ...userPermissions() } } });
    } catch {
      console.log("Error at: ", i);
    }
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
