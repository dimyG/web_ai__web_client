import {createSlice, nanoid} from '@reduxjs/toolkit';
import {model_options} from "./text2img_models";

const initialImgSettings = {
    prompt: 'a pinochio steampunk robot, bar lighting serving coffee and chips, highly detailed, digital painting, artstation, concept art, sharp focus, cinematic lighting, illustration, artgerm, greg rutkowski, alphonse mucha, cgsociety, octane render, unreal engine 5',
    model: model_options[0].value,
    seed: Math.floor(Math.random() * 10000),
    height: 768,
    width: 512,
    guidance_scale: 7.5,
    num_inference_steps: 50,
    submit: null
}

export const imagesSlice = createSlice({
  name: 'images',
  initialState: {
    // todo define an Image type, and define the state as a list of Images
    list: [],
    text2imgSettings: initialImgSettings
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
    },
    removeImage(state, action) {
      const id = action.payload
      state.list = state.list.filter(image => image.id !== id)
    },
    updateText2ImgSettings(state, action) {
      state.text2imgSettings = {...state.text2imgSettings, ...action.payload}
    }
  },
});

export const imagesSelector = state => state.images.list

export const text2imgSettingsSelector = state => state.images.text2imgSettings

export const {addImage, updateImage, removeImage, updateText2ImgSettings} = imagesSlice.actions

export default imagesSlice.reducer
