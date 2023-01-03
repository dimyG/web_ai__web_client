import Page from "src/components/Page";
import {Box, Container, Grid, makeStyles, Card, CardContent, Typography, Divider, Link} from "@material-ui/core";
import React from "react";
// import {Link as RouterLink} from "react-router-dom";
// import Logo from "src/components/Logo";
import TextPrompt from "./TextPrompt";
import ImageGrid from "./ImageGrid";

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

  return (
    <Page
      className={classes.root}
      title="Web AI"
    >
      <Container maxWidth={false}>
        {/*<Header />*/}
        {/*<Box mt={3}>*/}

          <Box mt={3}>
          <Card >
            <CardContent >
              <TextPrompt />
            </CardContent>
          </Card>
          </Box>

          <Box mt={3}>
          <Card>
          <CardContent className={classes.cardContent}>
            {/*<Box alignItems="center" display="flex" justifyContent="space-between" mb={3}></Box>*/}
            <ImageGrid />
          </CardContent>
          </Card>
          </Box>

        {/*</Box>*/}
      </Container>
    </Page>
  )
}

export default TextToImagePage
