import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit';

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: []
  },
  reducers: {
    addMessage: {
      reducer(state, action) {
        state.messages.push(action.payload)
      },
      // add an id to every message item that is added to the store
      prepare(messageItem) {
        return {
          payload: {
            id: nanoid(),
            ...messageItem
          }
        }
      }
    },
    markMessageSeen: (state, action) => {
      const seenMessageId = action.payload
      for (let i = 0; i <= state.messages.length - 1; i++) {
        if (state.messages[i].id === seenMessageId) {
          state.messages[i].seen = true
          break
        }
      }
    }
  },
});

export const messagesSelector = state => state.messages.messages

export const {addMessage, markMessageSeen} = messagesSlice.actions

export default messagesSlice.reducer
