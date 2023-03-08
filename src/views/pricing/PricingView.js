import React from 'react';
import clsx from 'clsx';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';
import useAuth from "src/hooks/useAuth";
import urls from "src/urls";
import {AxiosInstance2 as axios} from 'src/utils/axios';
import {Redirect, useHistory, useLocation} from 'react-router-dom';
import {updatePath} from "src/features/loginTargetPathSlice";
import {useDispatch} from "react-redux";
import {addMessage} from "src/features/Messages/messagesSlice";
import {TIERS} from "src/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    height: '100%',
    paddingTop: 120,
    paddingBottom: 120
  },
  product: {
    position: 'relative',
    padding: theme.spacing(5, 3),
    cursor: 'pointer',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    '&:hover': {
      transform: 'scale(1.025)'
    },
    // backgroundColor: theme.palette.background.third,
    color: theme.palette.text.primary  // the color of the text
  },
  activeProduct: {
    // no transform on hover
    transform: 'none !important',
  },
  productImage: {
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    top: -24,
    left: theme.spacing(3),
    height: 48,
    width: 48,
    fontSize: 24
  },
  recommendedProduct: {
    backgroundColor: theme.palette.background.fourth,
    color: theme.palette.common.white
  },
  chooseButton: {
    backgroundColor: theme.palette.common.white
  },
  emphasis: {
    color: theme.palette.secondary.main
  },
  container: {
    justifyContent: 'center'
  }
}));

const payUrl = urls.payments.create;

const PricingView = () => {
  const classes = useStyles();
  const { user, isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation()
  const dispatch = useDispatch()

  const freeOrUnauthenticatedUser = user? !isAuthenticated || user.tier === TIERS.free: true
  const premiumUser = user? user.tier === TIERS.premium: false

  const handleCheckout = async (amount) => {
    // // If the user is not authenticated, redirect to the login page. after login, the user will be redirected to current location
    if (!isAuthenticated) {
      const targetPath = !location.search ? location.pathname : `${location.pathname}/${location.search}`
      dispatch(updatePath(targetPath))  // store the target path to global store to redirect the user there after login
      history.push('/login');
      return
    }

    const data = {'amount': amount}
    const config = {}
    try {
      const response = await axios.post(payUrl, data, config);
      let message = {text: 'All set!', mode: "success", seen: false}
      dispatch(addMessage(message))
      user.tier = TIERS.premium  // modifying the context user object triggers a re-render
      history.push('/');
    } catch (error) {
      // console.error('Error making payment:', error.response);
      let message = {text: JSON.stringify(error), mode: "error", seen: false}
      dispatch(addMessage(message))
    }
  }

  return (
    <Page
      className={classes.root}
      title="Pricing"
    >
      <Container maxWidth="md">
        <Typography
          align="center"
          variant="h1"
          color="textPrimary"
        >
          Unleash your <span className={classes.emphasis}>potential</span> with magic <span className={classes.emphasis}>AI tools!</span>
        </Typography>
        {/*<Box mt={3}>*/}
        {/*  <Typography*/}
        {/*    align="center"*/}
        {/*    variant="subtitle1"*/}
        {/*    color="textSecondary"*/}
        {/*  >*/}
        {/*    Welcome to the first platform created for freelancers and agencies*/}
        {/*    for showcasing and finding the best clinets in the market.*/}
        {/*    30% of our income goes into Whale Charity*/}
        {/*  </Typography>*/}
        {/*</Box>*/}
      </Container>
      <Box mt="160px">
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            className={classes.container}
          >
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
            >
              <Paper
                className={clsx(classes.product, classes.activeProduct)}
                elevation={1}
              >
                <img
                  alt="Product"
                  className={classes.productImage}
                  src="/static/images/products/product_premium--outlined.svg"
                  color={'primary'}
                />
                <Typography
                  component="h3"
                  gutterBottom
                  variant="overline"
                  // color="inherit"
                >
                  Free
                </Typography>
                <div>
                  <Typography
                    component="span"
                    display="inline"
                    variant="h3"
                    // color="textPrimary"
                  >
                    {/*$5*/}<br/>
                  </Typography>
                  <Typography
                    component="span"
                    display="inline"
                    variant="subtitle2"
                    // color="textSecondary"
                  >
                    {/*/month*/}
                  </Typography>
                </div>
                <Typography
                  variant="overline"
                  // color="textSecondary"
                >
                  {/*Max 1 user*/}
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Typography
                  variant="body2"
                  // color="textPrimary"
                >
                  Create 30 images/day
                  <br />
                  Use images commercially
                  <br />
                  Some delay for image creation
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  className={classes.chooseButton}
                  disabled={true}
                >
                  Active
                </Button>
              </Paper>
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
            >
              <Paper
                className={clsx(classes.product, freeOrUnauthenticatedUser && classes.recommendedProduct, premiumUser && classes.activeProduct)}
                elevation={1}
              >
                <img
                  alt="Product"
                  className={classes.productImage}
                  src="/static/images/products/product_premium.svg"
                />
                <Typography
                  component="h3"
                  gutterBottom
                  variant="overline"
                  color="inherit"
                >
                  Premium
                </Typography>
                <div>
                  <Typography
                    component="span"
                    display="inline"
                    variant="h3"
                    color="inherit"
                  >
                    €15
                  </Typography>
                  <Typography
                    component="span"
                    display="inline"
                    variant="subtitle2"
                    color="inherit"
                  >
                    /month
                  </Typography>
                </div>
                <Typography
                  variant="overline"
                  color="inherit"
                >
                  {/*Max 3 user*/}
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Typography
                  variant="body2"
                  color="inherit"
                >
                  Everything Free tier has
                  <br />
                  + Create 2000 images/day
                  <br />
                  + Faster image creation
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  className={classes.chooseButton}
                  disabled={premiumUser}
                  onClick={() => handleCheckout(15)}
                >
                  { premiumUser? 'Active' : '(fake) Checkout'}
                </Button>
              </Paper>
            </Grid>
            {/*<Grid*/}
            {/*  item*/}
            {/*  md={4}*/}
            {/*  xs={12}*/}
            {/*>*/}
            {/*  <Paper*/}
            {/*    className={classes.product}*/}
            {/*    elevation={1}*/}
            {/*  >*/}
            {/*    <img*/}
            {/*      alt="Product"*/}
            {/*      className={classes.productImage}*/}
            {/*      src="/static/images/products/product_extended.svg"*/}
            {/*    />*/}
            {/*    <Typography*/}
            {/*      component="h3"*/}
            {/*      gutterBottom*/}
            {/*      variant="overline"*/}
            {/*      color="textSecondary"*/}
            {/*    >*/}
            {/*      Extended*/}
            {/*    </Typography>*/}
            {/*    <div>*/}
            {/*      <Typography*/}
            {/*        component="span"*/}
            {/*        display="inline"*/}
            {/*        variant="h3"*/}
            {/*        color="textPrimary"*/}
            {/*      >*/}
            {/*        $259*/}
            {/*      </Typography>*/}
            {/*      <Typography*/}
            {/*        component="span"*/}
            {/*        display="inline"*/}
            {/*        variant="subtitle2"*/}
            {/*        color="textSecondary"*/}
            {/*      >*/}
            {/*        /month*/}
            {/*      </Typography>*/}
            {/*    </div>*/}
            {/*    <Typography*/}
            {/*      variant="overline"*/}
            {/*      color="textSecondary"*/}
            {/*    >*/}
            {/*      Unlimited*/}
            {/*    </Typography>*/}
            {/*    <Box my={2}>*/}
            {/*      <Divider />*/}
            {/*    </Box>*/}
            {/*    <Typography*/}
            {/*      variant="body2"*/}
            {/*      color="textPrimary"*/}
            {/*    >*/}
            {/*      All from above*/}
            {/*      <br />*/}
            {/*      Unlimited 24/7 support*/}
            {/*      <br />*/}
            {/*      Personalised Page*/}
            {/*      <br />*/}
            {/*      Advertise your profile*/}
            {/*    </Typography>*/}
            {/*    <Box my={2}>*/}
            {/*      <Divider />*/}
            {/*    </Box>*/}
            {/*    <Button*/}
            {/*      variant="contained"*/}
            {/*      fullWidth*/}
            {/*      className={classes.chooseButton}*/}
            {/*    >*/}
            {/*      Choose*/}
            {/*    </Button>*/}
            {/*  </Paper>*/}
            {/*</Grid>*/}
          </Grid>
        </Container>
      </Box>
    </Page>
  );
};

export default PricingView;
