import axios from 'axios';

// This is the default axios instance used by the devias pro template.
// It is mocked in src\utils\mock.js and src\__mocks__\products.js
const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);


// This is a custom axios instance (not mocked).
const AxiosInstance2 = axios.create({
  baseURL: 'http://192.168.99.101:8001',
  // headers: {
  //   Authorization: localStorage.getItem('accessToken')
  //     ? 'Bearer ' + localStorage.getItem('accessToken')
  //     : null,
  //   'Content-Type': 'application/json',
  // },
});

AxiosInstance2.interceptors.request.use((config) => {
  console.log('Request:', config);
  return config;
});

AxiosInstance2.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.log('Error:', error);
    return Promise.reject((error.response && error.response.data) || 'Something went wrong')}
);


export default axiosInstance;
export { AxiosInstance2 };
