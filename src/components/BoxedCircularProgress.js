import React from "react";
import {Box, CircularProgress} from "@material-ui/core";

// when inside a div, centers the CircularProgress
const BoxedCircularProgress = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      textAlign="center"
      my={5}
    >
      <CircularProgress/>
    </Box>
  )
}

export default BoxedCircularProgress
