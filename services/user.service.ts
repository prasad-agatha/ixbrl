import APIService from "./api.service";
import {
  AUTH_VERIFY,
  AUTH_LOGIN,
  AUTH_FORGOT,
  AUTH_RESET,
  GET_USER_DATA,
  GET_USERS,
  UPDATE_USER,
} from "@/constants/endpoints";

class UserService extends APIService {
  verify(data: any): Promise<any> {
    return this.post(`${AUTH_VERIFY}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data;
      });
  }

  // User login
  login(data: any): Promise<any> {
    return this.post(`${AUTH_LOGIN}`, data)
      .then((res) => {
        this.setCookie("accessToken", res.data.token);
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // user password request
  forgot(data: any): Promise<any> {
    return this.post(`${AUTH_FORGOT}`, data)
      .then((res) => {
        return res.data?.msg;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // user password reset
  reset(data: any): Promise<any> {
    return this.post(`${AUTH_RESET}`, data)
      .then((res) => {
        return res.data?.msg;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // Get all users data
  getUsers(page: any, perPage: any, search: any, filter: any = ""): Promise<any> {
    return this.get(`${GET_USERS(page, perPage, search, filter)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // Get user data
  getUser(): Promise<any> {
    return this.get(`${GET_USER_DATA}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data;
      });
  }

  // create user
  createUser(data: any): Promise<any> {
    return this.post(`${GET_USERS(1, 10, "", "")}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // update user
  updateUser(id: any, data: any): Promise<any> {
    return this.put(`${UPDATE_USER(id)}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // delete user
  deleteUser(id: any): Promise<any> {
    return this.delete(`${UPDATE_USER(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }
}

export default UserService;
