import React from "react";
import {Box, Container, Grid, Link, Typography} from "@material-ui/core";
import {Link as RouterLink} from "react-router-dom";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles({
    about: {
      // position: 'absolute',
      // marginTop: 'calc(5% + 60px)',
      // bottom: 0,
      width: '100%',
      textAlign: 'center',
    }
})

const Footer = () => {
  const classes = useStyles()

  return (
    <Box className={classes.about}>
      <Box
        p={2}
        // borderRadius="borderRadius"
        bgcolor="background.default"
      >
        <Link
            variant="subtitle1"
            // color="secondary"
            component={RouterLink}
            to="/about"
          >
            About
        </Link>
      </Box>
    </Box>
  )
}

export default Footer
