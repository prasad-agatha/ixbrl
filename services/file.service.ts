import APIService from "./api.service";
import { GET_FILE, GET_FILES, UPLOAD_FILE_S3 } from "@/constants/endpoints";

class FileService extends APIService {
  s3upload(data: any): Promise<any> {
    return this.postWithMultiPartHeaders(`${UPLOAD_FILE_S3}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  getFiles(page: any, perPage: any, search: any): Promise<any> {
    return this.get(`${GET_FILES(page, perPage, search)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  getFile(id: any): Promise<any> {
    return this.get(`${GET_FILE(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // update file
  updateFile(id: any, data: any): Promise<any> {
    return this.put(`${GET_FILE(id)}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }
  // delete file
  deleteFile(id: any): Promise<any> {
    return this.delete(`${GET_FILE(id)}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // search context periods
  searchContext(id: any, search: any): Promise<any> {
    return this.get(`${GET_FILE(id)}/context?search=${search}`)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  // create context periods
  createContext(id: any, data: any): Promise<any> {
    return this.post(`${GET_FILE(id)}/context`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }

  uploadFile(data: any): Promise<any> {
    return this.post(`${GET_FILES(1, 10, "")}`, data)
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        throw error.response.data?.msg || error.response.data;
      });
  }
}

export default FileService;
