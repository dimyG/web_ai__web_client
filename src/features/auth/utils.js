import {AxiosInstance2 as axios} from "src/utils/axios";
import urls from "src/urls";
// import useAuth from "src/hooks/useAuth";

const auth_urls = urls.auth
const refresh_url = auth_urls.refreshToken

const setSession = (accessToken, refreshToken) => {
  console.info("setting Session:", accessToken, refreshToken)
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

const refreshSession = async () => {
  // todo: Rethink the whole refresh session logic
  // const { logout } = useAuth();  // this is not allowed in a function it must be in a component or a custom hook
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    // No refresh token, log out user
    // todo: logout() here or in the caller?
    return null;
  }

  try {
    const postData = {refresh: refreshToken}
    const { data } = await axios.post(refresh_url, postData);
    // response data = { access: "", access_token_expiration: ""}

    try{
      // the refresh token is valid
      const newAccessToken = data.access;
      setSession(newAccessToken, refreshToken);
      return newAccessToken;
    }

    catch (error) {
      // the refresh token is not valid
      // logout() here or in the caller?
      return null;
    }

    // logout();
  } catch (error) {
    // Error refreshing token, log out user or handle error
    console.error(error);
    // logout() here or in the caller?
    return null;
  }
}

export { setSession, refreshSession }
