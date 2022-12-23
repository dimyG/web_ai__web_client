import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import {useDispatch} from "react-redux";
import {updatePath} from "../features/loginTargetPathSlice";

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation()
  const dispatch = useDispatch()

  if (!isAuthenticated) {
    const targetPath = !location.search ? location.pathname : `${location.pathname}/${location.search}`
    dispatch(updatePath(targetPath))  // store the target path to global store to redirect the user there after login
    return <Redirect to="/login" />;
  }

  return (
    <>
      {children}
    </>
  );
};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;
