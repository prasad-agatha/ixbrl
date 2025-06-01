import axios, { AxiosPromise, CancelTokenSource } from "axios";

import cookie from "js-cookie";

abstract class APIService {
  getCookie(key: any): Promise<any> {
    return cookie.get(key) || null;
  }

  setCookie(key: any, data: any): void {
    cookie.set(key, data);
  }

  removeCookie(key: any): void {
    cookie.remove(key);
  }

  getAxiosHeaders(): any {
    return {
      Authorization: `Bearer ${cookie.get("accessToken")}`,
      "Content-Type": "application/json",
    };
  }

  get(url: string): AxiosPromise<any> {
    return axios({ method: "GET", url, headers: this.getAxiosHeaders() });
  }

  postWithMultiPartHeaders(url: string, data = {}): AxiosPromise<any> {
    return axios({
      method: "POST",
      url,
      data,
      headers: {
        Authorization: `Bearer ${cookie.get("accessToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  post(url: string, data = {}): AxiosPromise<any> {
    return axios({
      method: "POST",
      url,
      data,
      headers: this.getAxiosHeaders(),
    });
  }

  put(url: string, data = {}): AxiosPromise<any> {
    return axios({
      method: "PUT",
      url,
      data,
      headers: this.getAxiosHeaders(),
    });
  }

  delete(url: string): AxiosPromise<any> {
    return axios({
      method: "DELETE",
      url,
      headers: this.getAxiosHeaders(),
    });
  }
}

export default APIService;
