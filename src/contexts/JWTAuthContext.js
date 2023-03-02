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

// const initialUser = {
//   name: null,
//   avatar: null
// }

const auth_urls = urls.auth
const login_url = auth_urls.login
const logout_url = auth_urls.logout
const register_url = auth_urls.register

const anonymousUser = null

const createUser = (id, username, email = null, avatar = null) => {
  // 'name' and 'avatar' properties are used by the devias pro template in various places
  // console.log("creating user:", id, username, email, avatar)
  return id ? {
    'id': id, 'name': username, 'email': email, 'avatar': avatar
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
  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
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
    // const response = await axios.post('/api/account/login', { email, password });
    try {
      const response = await axios.post(login_url, {email, password});
      const accessToken = response.data.access_token
      const userData = response.data.user
      const user = createUser(userData.pk, userData.username, userData.email)

      reduxDispatch(readCsrfFromCookie())
      setSession(accessToken);
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
      setSession(null);
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
      setSession(accessToken);
      const userData = response.data.user
      const user = createUser(userData.pk, userData.username, userData.email)

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
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken && isValidToken(accessToken)) {
          console.debug("accessToken is valid")
          // on reload page get the user so to be logged in if he has a valid jwt accessToken
          setSession(accessToken);

          // the token is sent with the Authorization header set by the setSession function

          const jwt_claim = jwtDecode(accessToken)
          const [id, username, email] = [jwt_claim.user_id, jwt_claim.username, jwt_claim.email]
          const user = createUser(id, username, email)

          // Have in mind that user is not stored globally, it is stored in a Context, so no need to dispatch actions

          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: true,
              user
            }
          });
        } else {
          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: false,
              user: anonymousUser
            }
          });
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
