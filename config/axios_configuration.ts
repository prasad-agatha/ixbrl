import axios from "axios";
// service
import UserService from "services/user.service";

axios.defaults.baseURL = `/api`;

(function () {
  const userService = new UserService();
  const token = userService.getCookie("accessToken");

  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    axios.defaults.headers.common.Authorization = "";
  }
})();
