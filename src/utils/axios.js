import axios from 'axios';
import jwtDecode from 'jwt-decode';
import {refreshSession} from "src/features/auth/utils";
import urls from "src/urls";

const auth_urls = urls.auth
const refresh_url = auth_urls.refreshToken
const login_url = auth_urls.login
const logout_url = auth_urls.logout

// This is the default axios instance used by the devias pro template.
// It is mocked in src\utils\mock.js and src\__mocks__\products.js
const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);


// This is a custom axios instance (not mocked).
const AxiosInstance2 = axios.create({
  baseURL: 'https://jinifai',
  // headers: {
  //   Authorization: localStorage.getItem('accessToken')
  //     ? 'Bearer ' + localStorage.getItem('accessToken')
  //     : null,
  //   'Content-Type': 'application/json',
  // },
});

AxiosInstance2.interceptors.request.use((async (config) => {
  // console.debug(' - axios interceptor Request:', config);
  const url = config.url;  // the url of the current request

  // avoid refreshing the token if the current request is a refresh request, to avoid infinite loop
  const urlsToIgnore = [refresh_url, login_url];

  const ignoreUrl = urlsToIgnore.includes(url);
  const accessToken = localStorage.getItem('accessToken');

  if (!ignoreUrl && accessToken) {
    // check if token is expired
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // from milliseconds to seconds so that it can be compared to the exp value
    // const oneHour = currentTime + 3600 / 1000;
    const isExpired = decoded.exp < currentTime;
    if (isExpired) {
      console.info('Access token expired, refreshing token');
      // refreshSession() updates the accessToken in the axios header (and in localStorage) so the current request will succeed
      const newAccessToken = await refreshSession()
      config.headers.Authorization = `Bearer ${newAccessToken}`;  // update the axios header of the current request
    }
  }

  return config;
}));

AxiosInstance2.interceptors.response.use(
  (response) => {
    // console.debug(' - axios interceptor Response:', response);
    return response;
  },
  (error) => {
    console.error('Error:', error);
    return Promise.reject((error.response && error.response.data) || 'Something went wrong')}
);


export default axiosInstance;
export { AxiosInstance2 };
