import React from "react";
import {Card, CardContent, CardHeader, Container, Divider, Link, makeStyles, Typography} from "@material-ui/core";
import Page from "../components/Page";
import {Link as RouterLink} from "react-router-dom"
import {minHeapId} from "../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
}));

const About = () => {
  const classes = useStyles()

  return (
    <Page className={classes.root}>
      <Container >
      <Card >
        {/*<CardHeader title="About"/>*/}
        <CardContent>
          <Typography align="justify">
            Hello dear visitor! <br/><br/>
            My name is Dimitris Georgoulas. I'm a full stack web developer.
            I made this web app to familiarize myself with diffusion models. Have fun!
            You can find more about me at my <Link target="_blank" href={"https://dimgeo.com/"} color="secondary">blog</Link>.
          </Typography>
        </CardContent>
      </Card>
      </Container>
    </Page>
  )
}

export default About
