import React, {useEffect} from 'react'
import MinHeapAnimation from "./MinHeapAnimation";
import {Redirect} from "react-router";
import {minHeapId} from "../../constants";

const AnimationsRoute = ({match}) => {
  const algorithmId = parseInt(match.params.algorithmId)

  if (algorithmId === minHeapId) {
    return <MinHeapAnimation algorithmId={minHeapId}/>
  } else {
    return <Redirect to = '/404' />
  }
}

export default AnimationsRoute
