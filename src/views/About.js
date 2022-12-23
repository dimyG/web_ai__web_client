import React from "react";
import {Card, CardContent, CardHeader, Container, Link, makeStyles, Typography} from "@material-ui/core";
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
            Hello dear visitor. <br/><br/>
            My name is Dimitris Georgoulas. I'm a full stack web developer and mechanical engineer.
            You can find more about me at my personal <Link target="_blank" href={"https://dimgeo.com/"} color="secondary">website</Link>.
            This is a small project that I made so that I familiarize myself with React and its ecosystem. It has a simple CRUD
            functionality and an authentication system so that users can register and login. To add some flavor to it
            I also created the <Link to={`/animations/${minHeapId}/`} component={RouterLink} color="secondary">animation</Link> of
            an algorithm that uses a Min Heap to find the biggest items of an array.<br/><br/>

            I had a lot of fun playing with react and d3 to create the animation, so I will probably create more animations
            in the future with the Gradient Descent algorithm being a very good candidate...<br/><br/>

            I have used redux to store global state and the Devias Kit for the layout (it uses the Material UI components library).
            The back end is a simple API built with the django rest framework. You can find the project's
            source code in <Link target="_blank" href={"https://github.com/dimyG/algorithms_project"} color="secondary">this</Link> github repository.<br/><br/>
            Thanks for visiting, have nice day!
          </Typography>
        </CardContent>
      </Card>
      </Container>
    </Page>
  )
}

export default About
