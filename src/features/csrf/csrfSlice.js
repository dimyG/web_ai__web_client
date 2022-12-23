import Cookies from 'js-cookie'
import { createSlice } from '@reduxjs/toolkit';

const csrfSlice = createSlice({
    name: 'csrf',
    initialState: {
        'token': null
    },
    reducers: {
        readCsrfFromCookie: state => {
            // read the csrf token value from the cookie stored in the browser
            state.token = Cookies.get('csrftoken') || null  // undefined value caused state to be an empty object {} instead of {token: undefined}
        }
    },
})

export const {readCsrfFromCookie} = csrfSlice.actions
export default csrfSlice.reducer

export const csrfSelector = state => state.csrf.token
