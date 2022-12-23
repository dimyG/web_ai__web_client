import React from "react";
import {useEffect, useState} from "react";
import {getAlgorithmsThunk, getAllStatusSelector} from "./algorithmsSlice";
import {useSelector, useDispatch} from "react-redux";

// This component doesn't show anything on the page. It can be rendered whenever we want it to get the algorithms from the server
const GetAlgorithms = () => {
  const getAllStatus = useSelector(state => getAllStatusSelector(state))
  const dispatch = useDispatch()

  useEffect(() => {
    // since useEffect can't be an async function you can declare one inside it and call it later
    async function getItems(){
      await dispatch(getAlgorithmsThunk())
    }
    // Get items only on page load, not every time the component mounts.
    // This way you avoid the calls on back/forward operations to the component
    if (getAllStatus === 'idle'){
      const promise = getItems()
    }
  }, [getAllStatus, dispatch]) // I'm not sure if dispatch needs to be in the dependencies array

  return null
}

export default GetAlgorithms
