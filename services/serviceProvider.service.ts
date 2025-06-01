import APIService from "./api.service";
import { GET_SERVICE_PROVIDERS, UPDATE_SERVICE_PROVIDER } from "@/constants/endpoints";

class ServiceProviderService extends APIService {
  // Get all serviceProviders data
  getServiceProviders(page: any, perPage: any, search: any, apex: any): Promise<any> {
    return this.get(`${GET_SERVICE_PROVIDERS(page, perPage, search, apex)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // create serviceProviders
  createServiceProvider(data: any): Promise<any> {
    return this.post(`${GET_SERVICE_PROVIDERS(1, 10, "", "")}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // update serviceProvider
  updateServiceProvider(id: any, data: any): Promise<any> {
    return this.put(`${UPDATE_SERVICE_PROVIDER(id)}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // delete serviceProvider
  deleteServiceProvider(id: any): Promise<any> {
    return this.delete(`${UPDATE_SERVICE_PROVIDER(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }
}

export default ServiceProviderService;
