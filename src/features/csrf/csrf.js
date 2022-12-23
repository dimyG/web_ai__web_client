import React from "react";
import {useDispatch} from "react-redux";
import {readCsrfFromCookie} from "./csrfSlice";
import {useEffect} from 'react'

export const Csrf = () => {
    const dispatch = useDispatch()

    // Have in mind that whe a user logs in, a new csrf token is set to the cookie by the server. This means that you
    // whenever such an action takes place, the csrf token stored in redux, must be updated which means that the
    // todo readFromCookie action must be dispatched. Currently I do this "manually" after every action that doesn;t
    // modify the redux state. If it did then the CSRF component would be re-rendered and the new value would be used
    // maybe perform this after every action, using a middleware
    useEffect(() => {
        dispatch(readCsrfFromCookie())
    })

    return null
}
