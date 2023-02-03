import {createSlice, nanoid} from '@reduxjs/toolkit';

export const imagesSlice = createSlice({
  name: 'images',
  initialState: {
    list: []
  },
  reducers: {
    addImage: {
      reducer(state, action) {
        state.list.push(action.payload)
      },
      // add an id to every item that is added to the store
      prepare(item) {
        return {
          payload: {
            id: nanoid(),
            ...item
          }
        }
      }
    },
  },
});

export const imagesSelector = state => state.images.list

export const {addImage} = imagesSlice.actions

export default imagesSlice.reducer
