import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import {useSelector} from "react-redux";
import {pathSelector} from "../features/loginTargetPathSlice";

const GuestGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // read the login target path from the global store and redirect the user there
  const loginTargetPath = useSelector(state => pathSelector(state))

  if (isAuthenticated) {
    return <Redirect to={loginTargetPath} />;
  }

  return (
    <>
      {children}
    </>
  );
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
