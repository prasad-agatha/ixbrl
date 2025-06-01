import APIService from "./api.service";
import { GET_TAXONOMY, GET_TAXONOMIES } from "@/constants/endpoints";

class TaxonomyService extends APIService {
  getTaxonomies(): Promise<any> {
    return this.get(`${GET_TAXONOMIES()}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // create taxonomy
  createTaxonomy(data: any): Promise<any> {
    return this.post(`${GET_TAXONOMIES()}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // search taxonomy
  searchTaxonomy(id: any): Promise<any> {
    return this.get(`${GET_TAXONOMY(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // search taxonomy
  searchFilterTaxonomy(id: any, data: any): Promise<any> {
    return this.post(`${GET_TAXONOMY(id)}/search`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // update taxonomy
  updateTaxonomy(id: any, data: any): Promise<any> {
    return this.put(`${GET_TAXONOMY(id)}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // delete taxonomy
  deleteTaxonomy(id: any): Promise<any> {
    return this.delete(`${GET_TAXONOMY(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }
}

export default TaxonomyService;
