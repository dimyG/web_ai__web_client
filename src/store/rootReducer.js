import { combineReducers } from '@reduxjs/toolkit';
import { reducer as calendarReducer } from 'src/slices/calendar';
import { reducer as chatReducer } from 'src/slices/chat';
import { reducer as formReducer } from 'redux-form';
import { reducer as kanbanReducer } from 'src/slices/kanban';
import { reducer as mailReducer } from 'src/slices/mail';
import { reducer as notificationReducer } from 'src/slices/notification';
import counterReducer from '../features/counter/counterSlice';
import algorithmsReducer from '../features/algorithms/algorithmsSlice'
import csrfReducer from '../features/csrf/csrfSlice'
import loginTargetPathReducer from '../features/loginTargetPathSlice'
import messagesReducer from 'src/features/Messages/messagesSlice'
import imagesReducer from 'src/features/textToImage/imagesSlice'

const rootReducer = combineReducers({
  calendar: calendarReducer,
  chat: chatReducer,
  form: formReducer,
  kanban: kanbanReducer,
  mail: mailReducer,
  notifications: notificationReducer,
  counter: counterReducer,
  algorithms: algorithmsReducer,
  csrf: csrfReducer,
  loginTargetPath: loginTargetPathReducer,
  messages: messagesReducer,
  images: imagesReducer,
});

export default rootReducer;
