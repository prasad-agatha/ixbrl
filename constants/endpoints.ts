export const AUTH_VERIFY = "/verify";
export const AUTH_LOGIN = "/login";
export const AUTH_FORGOT = "/forgot";
export const AUTH_RESET = "/reset";

export const UPLOAD_FILE_S3 = `/s3-upload`;
export const GET_FILES = (page: any, perPage: any, search: any) =>
  `/files?page=${page}&perPage=${perPage}&search=${search}`;
export const GET_FILE = (id: any) => `/files/${id}`;

export const GET_USER_DATA = `/user-details`;
export const GET_USERS = (page: any, perPage: any, search: any, filter: any) =>
  `/users?page=${page}&perPage=${perPage}&search=${search}&filter=${filter}`;
export const UPDATE_USER = (id: any) => `/users/${id}`;

export const GET_SERVICE_PROVIDERS = (page: any, perPage: any, search: any, apex: any) =>
  `/serviceProviders?page=${page}&perPage=${perPage}&search=${search}&apex=${apex}`;
export const UPDATE_SERVICE_PROVIDER = (id: any) => `/serviceProviders/${id}`;

export const GET_CLIENTS = (page: any, perPage: any, search: any) =>
  `/clients?page=${page}&perPage=${perPage}&search=${search}`;
export const UPDATE_CLIENT = (id: any) => `/clients/${id}`;

export const CREATE_TAGS = () => `/tags`;
export const GET_TAG = (id: any) => `/tags/${id}`;

export const GET_TAXONOMIES = () => `/taxonomy`;
export const GET_TAXONOMY = (id: any) => `/taxonomy/${id}`;

export const GET_ELEMENT = (search: any) => `/elements?search=${search}`;
