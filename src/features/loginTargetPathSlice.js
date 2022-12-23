import { createSlice } from '@reduxjs/toolkit';

const pathSlice = createSlice({
    name: 'loginTargetPath',
    initialState: {
        path: "/"
    },
    reducers: {
        updatePath: {
          reducer(state, action) {state.path = action.payload}
        }
    },
})

export const pathSelector = state => state.loginTargetPath.path

export const {updatePath} = pathSlice.actions

export default pathSlice.reducer
