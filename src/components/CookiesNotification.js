import React, {
  useState,
  useEffect
} from 'react';
import Cookies from 'js-cookie';
import {
  Box,
  Button,
  Link,
  Portal,
  Typography,
  makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.fifth,  // rgb(138 133 255 / 25%)  // rgb(57 73 171 / 60%);
    color: theme.palette.common.white,
    maxWidth: 700,
    position: 'fixed',
    bottom: 0,
    left: 0,
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    outline: 'none',
    zIndex: 2000
  },
  action: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black
  }
}));

const CookiesNotification = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    Cookies.set('consent', 'true');
    setOpen(false);
  };

  useEffect(() => {
    const consent = Cookies.get('consent');

    if (!consent) {
      setOpen(true);
    }
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'block' }}>
    <Portal>
      <div className={classes.root} style={{ position: 'absolute', left: 10, right: 10, bottom: 10, margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body1" color="inherit">
          We use Cookies to ensure that we give you the best experience on our
          website.
          {/*Read our*/}
          {/*{' '}*/}
          {/*<Link*/}
          {/*  component="a"*/}
          {/*  color="inherit"*/}
          {/*  underline="always"*/}
          {/*  href="https://devias.io/privacy-policy"*/}
          {/*  target="_blank"*/}
          {/*>*/}
          {/*  Privacy Policy*/}
          {/*</Link>*/}
          {/*.*/}
        </Typography>
        <Box mt={2} display="flex" justifyContent="center">
          <Button onClick={handleClose} variant="contained" className={classes.action}>
            I Agree
          </Button>
        </Box>
      </div>
    </Portal>
    </div>
  );
};

export default CookiesNotification;
