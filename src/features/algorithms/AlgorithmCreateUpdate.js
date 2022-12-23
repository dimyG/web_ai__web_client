import React from 'react';
import {
  Box,
  Container,
  Grid,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';
import AlgorithmForm from "./AlgorithmForm";
import GetAlgorithms from "./GetAlgorithms";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const CreateUpdateForm = ({match}) => {
  const classes = useStyles();
  const { algorithmId } = match.params;
  const isAddMode = !algorithmId;

  console.log("match: ", match, "isAdd mode: ", isAddMode, "algorithmId", algorithmId)

  return (
    <Page
      className={classes.root}
      title="Formik Form"
    >
      <Container maxWidth="lg">
        {/*<Breadcrumbs*/}
        {/*  separator={<NavigateNextIcon fontSize="small" />}*/}
        {/*  aria-label="breadcrumb"*/}
        {/*>*/}
        {/*  <Link*/}
        {/*    variant="body1"*/}
        {/*    color="inherit"*/}
        {/*    to="/app"*/}
        {/*    component={RouterLink}*/}
        {/*  >*/}
        {/*    Dashboard*/}
        {/*  </Link>*/}
        {/*  <Typography*/}
        {/*    variant="body1"*/}
        {/*    color="textPrimary"*/}
        {/*  >*/}
        {/*    Forms*/}
        {/*  </Typography>*/}
        {/*</Breadcrumbs>*/}
        {/*<Typography*/}
        {/*  variant="h3"*/}
        {/*  color="textPrimary"*/}
        {/*>*/}
        {/*  Formik*/}
        {/*</Typography>*/}
        <Box mt={1}>
          <Grid container>
            <Grid
              item
              xs={12}
            >
              <AlgorithmForm isAddMode={isAddMode} algorithmId={algorithmId} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Page>
  );
};

export default CreateUpdateForm;
