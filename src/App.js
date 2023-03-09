import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { create } from 'jss';
import rtl from 'jss-rtl';
import MomentUtils from '@date-io/moment';
import { SnackbarProvider } from 'notistack';
import {
  jssPreset,
  StylesProvider,
  ThemeProvider,
  Button
} from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import GlobalStyles from 'src/components/GlobalStyles';
import ScrollReset from 'src/components/ScrollReset';
import CookiesNotification from 'src/components/CookiesNotification';
import GoogleAnalytics from 'src/components/GoogleAnalytics';
import SettingsNotification from 'src/components/SettingsNotification';
import { AuthProvider } from 'src/contexts/JWTAuthContext';
import useSettings from 'src/hooks/useSettings';
import { createTheme } from 'src/theme';
import routes, { renderRoutes } from 'src/routesCustom';
// import {Csrf} from "./features/csrf/csrf";
import Messages from "./features/Messages/Messages";
// import GetAlgorithms from "./features/algorithms/GetAlgorithms";

const jss = create({ plugins: [...jssPreset().plugins, rtl()] });
const history = createBrowserHistory();

// todo: loading during inference
// todo: dummy inference on load to warm the server
// todo: image actions: download, like, save
// todo: use of refresh token to keep user logged in
const App = () => {
  const { settings } = useSettings();

  const theme = createTheme({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    theme: settings.theme
  });

  // add action to all snackbars
  const notistackRef = React.createRef();
  const onClickDismiss = key => () => {
      notistackRef.current.closeSnackbar(key);
  }


  return (
    <ThemeProvider theme={theme}>
      <StylesProvider jss={jss}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <SnackbarProvider
            dense
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            ref={notistackRef}
            action={(key) => (
                <Button onClick={onClickDismiss(key)}>
                    X
                </Button>
            )}
          >
            {/*<Csrf/>*/}
            <Messages/>
            {/* get algorithms when you load the app. we need this here so that the Min Heap algorithm is always present in the side bar */}
            {/*<GetAlgorithms/>*/}
            <Router history={history}>
              <AuthProvider>
                <GlobalStyles />
                <ScrollReset />
                <GoogleAnalytics />
                <CookiesNotification />
                {/*<SettingsNotification />*/}
                {renderRoutes(routes)}
              </AuthProvider>
            </Router>
          </SnackbarProvider>
        </MuiPickersUtilsProvider>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default App;
