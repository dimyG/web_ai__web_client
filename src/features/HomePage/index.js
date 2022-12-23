import Page from "../../components/Page";
import {Box, Container, Grid, makeStyles, Card, CardContent, Typography} from "@material-ui/core";
import Header from "../algorithms/AlgorithmsListView/Header";
import GetAlgorithms from "../algorithms/GetAlgorithms";
import Results from "../algorithms/AlgorithmsListView/Results";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const HomePage = () => {
  const classes = useStyles()

  return (
    <Page
      className={classes.root}
      title="Algorithms List"
    >
      <Container maxWidth={false}>
        {/*<Header />*/}
        <Box mt={3}>
          <Card >
            <CardContent >
              <Typography>This is the homepage</Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Page>
  )
}

export default HomePage
