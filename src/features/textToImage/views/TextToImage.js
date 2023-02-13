import Page from "src/components/Page";
import {
  Box,
  Container,
  Grid,
  makeStyles,
  Card,
  CardContent,
  Typography,
  Divider,
  Link,
  CardHeader
} from "@material-ui/core";
import React from "react";
// import {Link as RouterLink} from "react-router-dom";
// import Logo from "src/components/Logo";
import TextPrompt from "./TextPrompt";
import ImageGrid from "./ImageGrid";
import {useSelector} from "react-redux";
import {imagesSelector} from "../imagesSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const TextToImagePage = () => {
  const classes = useStyles()
  let images = useSelector(state => imagesSelector(state))

  return (
    <Page
      className={classes.root}
      title="Web AI"
    >
      <Container maxWidth={false}>
        <TextPrompt />
        {images.length === 0 ? null : (
          <ImageGrid />
        )}
      </Container>
    </Page>
  )
}

export default TextToImagePage
