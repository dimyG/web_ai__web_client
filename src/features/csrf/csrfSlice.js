import Cookies from 'js-cookie'
import { createSlice } from '@reduxjs/toolkit';

const csrfSlice = createSlice({
    name: 'csrf',
    initialState: {
        'token': null
    },
    reducers: {
        readCsrfFromCookie: state => {
          // If you store the jwt in a cookie, then you need to implement csrf protection. In this case,
          // read the csrf from an endpoint and store it in a "csrf" http_only cookie.
          // You can set the cookie when the react app is rendered. This is done with a csrf component that is rendered by the main app.
          // Have in mind though that the cookie should be
          // updated whenever a user logs because django rotates the token after a login for security reasons.
          // A login doesn't rerender the app, the csrf component isn't re-rendered, so you need to dispatch
          // this action after every login. On logout the main app is re-rendered,
          // so the csrf component is re-rendered and the cookie is updated.

          // read the csrf token value from the cookie stored in the browser
          state.token = Cookies.get('csrftoken') || null  // undefined value caused state to be an empty object {} instead of {token: undefined}
        }
    },
})

export const {readCsrfFromCookie} = csrfSlice.actions
export default csrfSlice.reducer

export const csrfSelector = state => state.csrf.token
