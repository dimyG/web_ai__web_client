import React, {
  createContext,
  useEffect,
  useReducer
} from 'react';
import jwtDecode from 'jwt-decode';
import SplashScreen from 'src/components/SplashScreen';
import {AxiosInstance2 as axios} from 'src/utils/axios';
// import axios from "axios";
import {useDispatch} from "react-redux";
import {addMessage} from "../features/algorithms/algorithmsSlice";
import {readCsrfFromCookie} from "../features/csrf/csrfSlice";
import urls from "src/urls";
import {refreshSession, setSession} from "src/features/auth/utils";
import {TIERS} from "src/constants";

// const initialUser = {
//   name: null,
//   avatar: null
// }

const auth_urls = urls.auth
const login_url = auth_urls.login
const logout_url = auth_urls.logout
const register_url = auth_urls.register

const anonymousUser = null

const createUser = (id, username, email = null, tier = TIERS.free, avatar = null) => {
  // 'name' and 'avatar' properties are used by the devias pro template in various places
  // console.log("creating user:", id, username, email, avatar)
  return id ? {
    'id': id, 'name': username, 'email': email, 'tier': tier, 'avatar': avatar
  } : anonymousUser
}

const initialAuthState = {
  isAuthenticated: false,
  isInitialised: false,
  user: anonymousUser
};

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;  // Get the current Unix timestamp in seconds

  return decoded.exp > currentTime;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALISE': {
      const { isAuthenticated, user } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: anonymousUser
      };
    }
    case 'REGISTER': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user
      };
    }
    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialAuthState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => { },
  register: () => Promise.resolve()
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const reduxDispatch = useDispatch()

  const login = async (email, password) => {
    try {
      const response = await axios.post(login_url, {email, password});
      const accessToken = response.data.access_token
      const refreshToken = response.data.refresh_token
      const userData = response.data.user
      const jwt_claim = jwtDecode(accessToken)
      // console.debug(`access token expires in ${jwt_claim.exp - Date.now() / 1000} seconds`);
      // the userData response does not contain the tier yet, so we get it from the jwt claim todo: make it consistent
      let tier = jwt_claim.tier
      // Important: if you read the email from the jwt claim, use a variable name different from "email" because
      // it caused an issue where the email argument was becoming undefined within the try block! (I don't know why)
      // let jwtEmail = jwt_claim.email
      const user = createUser(userData.pk, userData.username, userData.email, tier)

      reduxDispatch(readCsrfFromCookie())
      setSession(accessToken, refreshToken);
      dispatch({
        type: 'LOGIN',
        payload: {
          user
        }
      });
    }catch (error) {
      reduxDispatch(addMessage({text: `${error}`, mode: "error", seen: false}))
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(logout_url);
      setSession(null, null);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      reduxDispatch(addMessage({text: `${error}`, mode: "error", seen: false}))
    }
  };

  const register = async (email, password1, password2) => {
    try {
      const response = await axios.post(register_url, {
        email: email,
        // name,
        password1: password1,
        password2: password2,
      });
      const accessToken = response.data.access_token
      const refreshToken = response.data.refresh_token
      setSession(accessToken, refreshToken);
      const userData = response.data.user
      // the userData response does not contain the tier yet, so we get it from the jwt claim todo: make it consistent
      const jwt_claim = jwtDecode(accessToken)
      let tier = jwt_claim.tier
      const user = createUser(userData.pk, userData.username, userData.email, tier)

      // window.localStorage.setItem('accessToken', accessToken);

      dispatch({
        type: 'REGISTER',
        payload: {
          user
        }
      });
    } catch (error) {
      // console.log("register error:", typeof(error), error.message)
      let errorTextMessage
      if (error.response){
        errorTextMessage = JSON.stringify(error.response.data)
      }
      reduxDispatch(addMessage({text: errorTextMessage, mode: "error", seen: false}))
    }
  };

  useEffect(() => {
    const initialise = async () => {
      // console.debug("initialising auth context...")
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        const refreshToken = window.localStorage.getItem('refreshToken');

        if (accessToken && isValidToken(accessToken)) {
          console.debug("accessToken is valid")

          // on reload page get the user so to be logged in if he has a valid jwt accessToken
          setSession(accessToken, refreshToken);

          // the token is sent with the Authorization header set by the setSession function

          const jwt_claim = jwtDecode(accessToken)
          const [id, username, email, tier] = [jwt_claim.user_id, jwt_claim.username, jwt_claim.email, jwt_claim.tier]
          const user = createUser(id, username, email, tier)

          // Have in mind that user is not stored globally, it is stored in a Context, so no need to dispatch actions

          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: true,
              user
            }
          });
        }

        else {
          // if the accessToken is not valid, refresh it
          // console.debug("accessToken is not valid")

          const newAccessToken = await refreshSession()

          if (!newAccessToken){
            // if the refresh token is not valid we initialize with an anonymous user
            console.debug("refresh token is not valid")
            setSession(null, null)
            dispatch({
              type: 'INITIALISE',
              payload: {
                isAuthenticated: false,
                user: anonymousUser
              }
            });
          }

          else {
            // if the refresh token is valid we initialize with the new access token
            // console.debug("refresh token is valid")

            // setSession(newAccessToken, refreshToken);  // call to refreshSession already sets the session
            const jwt_claim = jwtDecode(newAccessToken)
            const [id, username, email, tier] = [jwt_claim.user_id, jwt_claim.username, jwt_claim.email, jwt_claim.tier]
            const user = createUser(id, username, email, tier)

            dispatch({
              type: 'INITIALISE',
              payload: {
                isAuthenticated: true,
                user: user
              }
            });
          }

        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALISE',
          payload: {
            isAuthenticated: false,
            user: anonymousUser
          }
        });
      }
    };

    initialise();
  }, []);

  if (!state.isInitialised) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
