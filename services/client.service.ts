import APIService from "./api.service";
import { GET_CLIENTS, UPDATE_CLIENT } from "@/constants/endpoints";

class ClientService extends APIService {
  // Get all clients data
  getClients(page: any, perPage: any, search?: any): Promise<any> {
    return this.get(`${GET_CLIENTS(page, perPage, search)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // create clients
  createClient(data: any): Promise<any> {
    return this.post(`${GET_CLIENTS(1, 10, "")}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // update client
  updateClient(id: any, data: any): Promise<any> {
    return this.put(`${UPDATE_CLIENT(id)}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // delete client
  deleteClient(id: any): Promise<any> {
    return this.delete(`${UPDATE_CLIENT(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }
}

export default ClientService;
