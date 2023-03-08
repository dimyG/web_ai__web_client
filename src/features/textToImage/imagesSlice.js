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
    },
    updateImage(state, action) {
      const {id, img_src} = action.payload
      const existingImage = state.list.find(image => image.id === id)
      if (existingImage) {
        existingImage.img_src = img_src
      }
    }
  },
});

export const imagesSelector = state => state.images.list

export const {addImage, updateImage} = imagesSlice.actions

export default imagesSlice.reducer
