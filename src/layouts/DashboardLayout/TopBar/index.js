import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  AppBar,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  makeStyles,
  SvgIcon,
  Button, Typography
} from '@material-ui/core';
import {Menu as MenuIcon, LogIn as LoginIcon} from 'react-feather';
import Logo from 'src/components/Logo';
import { THEMES } from 'src/constants';
import Account from './Account';
import Contacts from './Contacts';
import Notifications from './Notifications';
import Search from './Search';
import Settings from './Settings';
import useAuth from "../../../hooks/useAuth";

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: theme.zIndex.drawer + 100,
    ...theme.name === THEMES.LIGHT ? {
      boxShadow: 'none',
      backgroundColor: theme.palette.primary.main
    } : {},
    ...theme.name === THEMES.ONE_DARK ? {
      backgroundColor: theme.palette.background.default
    } : {}
  },
  toolbar: {
    minHeight: 64
  },
  topBarButton: {
    boxShadow: "none",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  }
}));

const Login = () => {
  const classes = useStyles()
  const { user } = useAuth()

  if (user){
    return null
  }

  return (
    <Button
      component={RouterLink}
      to="/login"
      color="secondary"
      variant="contained"
      className={classes.topBarButton}
      size='small'
      startIcon={
        <SvgIcon fontSize="small">
          <LoginIcon />
        </SvgIcon>
      }
    >
      Login
    </Button>
  )
}

const Register = () => {
  const classes = useStyles()
  const { user } = useAuth()

  if (user){
    return null
  }

  return (

    <Button
      component={RouterLink}
      to="/register"
      color="secondary"
      variant="text"
      className={classes.topBarButton}
      size='small'
    >
      <Box color="white">Register</Box>
    </Button>
  )
}

const Pricing = () => {
  const classes = useStyles()

  return (
    <Button
      component={RouterLink}
      to="/pricing"
      color="secondary"
      variant="text"
      className={classes.topBarButton}
      size='small'
    >
      <Box color="white">Pricing</Box>
    </Button>
  )
}

const TopBar = ({
  className,
  onMobileNavOpen,
  ...rest
}) => {
  const classes = useStyles();
  const { user } = useAuth();

  return (
    <AppBar
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Toolbar className={classes.toolbar}>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={onMobileNavOpen}
          >
            <SvgIcon fontSize="small">
              <MenuIcon />
            </SvgIcon>
          </IconButton>
        </Hidden>
        <Hidden mdDown>
          <RouterLink to="/">
            <Logo />
          </RouterLink>
        </Hidden>
        <Box
          ml={2}
          flexGrow={1}
        />
        {/*<Search />*/}
        {/*<Contacts />*/}
        {/*<Notifications />*/}
        <Login/>
        <Register/>
        <Pricing/>
        <Settings />
        { user? (
          <Box ml={2}>
            <Account />
          </Box>
        ) : null }
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func
};

TopBar.defaultProps = {
  onMobileNavOpen: () => {}
};

export default TopBar;
