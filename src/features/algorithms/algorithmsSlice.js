import {createSlice, createAsyncThunk, nanoid} from '@reduxjs/toolkit';
import axios from 'axios'
import store from "../../store"

async function long(){
  console.log('running long task...')
  let i=0
  for (i; i<1*10**9; i++){
  }
  return i
}

// todo in 401 responses and especially on "not valid token" responses, log the user out so not to have the
// inconsistency of appearing logged in while in reality his token has expired and he is logged out

// Have in mind:
// payloadCreator is a callback function that should return a promise containing the result of some asynchronous logic.
// It may also return a value synchronously. If there is an error, it should either return a rejected promise
// containing an Error instance or a plain value such as a descriptive error message or otherwise a resolved promise
// with a RejectWithValue argument as returned by the thunkAPI.rejectWithValue function. The RejectWithValue
// approach is the only way I found to get the server generated error message (for example item with this name already exists)
export const getAlgorithmsThunk = createAsyncThunk('algorithms/get', async (dummy, {rejectWithValue}) => {
  // const response = await axios.get('/algorithms/')
  try {
    const response = await axios.get('/api/algorithms/')
    // console.log('getAlgorithmsThunk response:', response)
    return response.data
  }catch (error) {
    // console.log('getAlgorithmsThunk error', JSON.stringify(error))
    store.dispatch(algorithmsSlice.actions.addMessage({text: JSON.stringify(error.message), mode: "error", seen: false}))
    return rejectWithValue(error.message)
  }
})

export const createAlgorithmThunk = createAsyncThunk('algorithms/create', async ({name, csrfToken}, {rejectWithValue}) => {
  // const long_result = await long()
  // console.log('long_result: ', long_result)
  const slug = name.replace(/ /g, '')
  const body = {'name': name, 'slug': slug}
  // have in mind that when using session authentication backend csrf token is only necessary for authenticated requests
  const config = {headers: {'X-CSRFToken': csrfToken}}
  try{
    const response = await axios.post('/api/algorithms/', body, config)
    // console.log('createAlgorithmThunk response:', response)
    const successMessage = `algorithm ${response.data.name} created successfully`
    store.dispatch(algorithmsSlice.actions.addMessage({text: successMessage, mode: "success", seen: false}))
    return response.data
  }catch (error) {
    // todo handle all action errors (get, create, update etc.) the same way (if error.response, if else error.request, else)
    let error_payload
    if (error.response){
      // Request was made and the server responded
      // error.response is an object with config, data, headers, request, status and statusText attributes
      // in case of 403, for example csrf error, then return the given message instead of the error data which is an html page
      const forbidden_msg = "Your request was forbidden"
      error.response.status === 403 ? error_payload = forbidden_msg : error_payload = error.response.data
    } else if (error.request) {
      // Request was made but no response received
      // console.log("error.request:", error.request)
      error_payload = error.request
    } else {
      // Request was not made, something happened in setting up the request
      // console.log("error.message:", error.message)
      error_payload = error.message
    }
    store.dispatch(addMessage({text: JSON.stringify(error_payload), mode: 'error', seen: false}))
    return rejectWithValue(error_payload)
  }

    // this is a stackoverflow answer for handling django validation error's and more. An equivalent
    // approach could be used with the async/await syntax instead of .then and the use of rejectWithValue
    // axios.post('/algorithms/', body, config)
    // .then(response => {
    //   console.log('createAlgorithmThunk response', response)
    //   return (response.data)
    // })
    // .catch(function (error) {
    //   if (error.response) {
    //     // The request was made and the server responded with a status code
    //     // that falls out of the range of 2xx
    //     console.log(error.response.data);
    //     console.log(error.response.status);
    //     console.log(error.response.headers);
    //   } else if (error.request) {
    //     // The request was made but no response was received
    //     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //     // http.ClientRequest in node.js
    //     console.log(error.request);
    //   } else {
    //     // Something happened in setting up the request that triggered an Error
    //     console.log('Error', error.message);
    //   }
    //   console.log(error.config);
    // });
})

export const updateAlgorithmThunk = createAsyncThunk("algorithms/update", async ({id, name, csrfToken}, {rejectWithValue}) => {
  const slug = name.replace(/ /g, '')
  const body = {'id': id, 'name': name, 'slug': slug}
  const config = {headers: {'X-CSRFToken': csrfToken}}
  try {
    // the trailing slash is needed by django in PUT requests
    const response = await axios.put(`/api/algorithms/${id}/`, body, config)
    // console.log("edit algorithm thunk response:", response)
    const successMessage = `algorithm ${response.data.name} updated successfully`
    store.dispatch(algorithmsSlice.actions.addMessage({text: successMessage, mode: "success", seen: false}))
    return response.data
  } catch (error) {
    // console.log("edit algorithm thunk error:", JSON.stringify(error))
    store.dispatch(algorithmsSlice.actions.addMessage({text: JSON.stringify(error.message), mode: "error", seen: false}))
    return rejectWithValue(error.message)
  }
})

export const getAlgorithmThunk = createAsyncThunk("algorithm/get", async ({id}, {rejectWithValue}) => {
  const config = {"data": {'id': id}}
  try {
    const response = await axios.get(`/api/algorithms/${id}/`, config)
    console.log("get algorithm thunk response:", response)
    return response.data
  } catch (error) {
    console.log("get algorithm thunk error:", JSON.stringify(error))
    store.dispatch(algorithmsSlice.actions.addMessage({text: JSON.stringify(error.message), mode: "error", seen: false}))
    return rejectWithValue(error.message)
  }
})

export const deleteAlgorithmThunk = createAsyncThunk("algorithm/delete", async({id, csrfToken}, {rejectWithValue}) =>{
  const data = {"id": id}
  const headers = {'X-CSRFToken': csrfToken}
  const config = {data: data, headers: headers}
  try{
    const response = await axios.delete(`/api/algorithms/${id}/`, config)
    console.log("delete algorithm thunk response:", response)
    store.dispatch(algorithmsSlice.actions.addMessage({text: 'Algorithm deleted successfully', mode: "success", seen: false}))
    // the delete response.data is an empty string not the deleted item
    return id
  }catch (error){
    console.log("delete algorithm thunk error:", JSON.stringify(error))
    let error_payload
    if (error.response){
      // Request was made and the server responded
      error_payload = error.response.status === 401 ? "You have to Login first" : error.response.data
    } else if (error.request) {
      // Request was made but no response received
      error_payload = error.request
    } else {
      // Request was not made, something happened in setting up the request
      error_payload = JSON.stringify(error.message)
    }
    store.dispatch(algorithmsSlice.actions.addMessage({text: error_payload, mode: "error", seen: false}))
    return rejectWithValue(error.message)
  }
})

export const deleteAlgorithmsThunk = createAsyncThunk("algorithms/delete", async({ids, csrfToken}, {rejectWithValue}) =>{
  const state = store.getState()
  const noAnimationIds = ids.filter(id => {
    // algorithms with animation are protected from deletion
    const algorithm = algorithmByIdSelector(state, id)
    if (algorithm && !algorithm.has_animation) return id
  })
  const data = noAnimationIds.map(id => {return {"id": id}})
  const headers = {'X-CSRFToken': csrfToken}
  const config = {data: data, headers: headers}
  try{
    const response = await axios.delete("/api/algorithms/delete_many/", config)
    console.log("delete many algorithms thunk response:", response)
    // the delete response.data is an empty string not the deleted item
    const successMessage = `${noAnimationIds.length} algorithms deleted successfully`
    store.dispatch(algorithmsSlice.actions.addMessage({text: successMessage, mode: "success", seen: false}))
    return {ids: noAnimationIds, responseData: response.data}
  }catch (error){
    console.log("delete many algorithms thunk error:", JSON.stringify(error))
    store.dispatch(algorithmsSlice.actions.addMessage({text: JSON.stringify(error.message), mode: "error", seen: false}))
    return rejectWithValue(error.message)
  }
})

// update the items array with the updatedItem object based on id match
const updateItemsById = (items, updatedItem) => {
  const oldItem = items.filter(item => item.id === updatedItem.id)[0]
  !oldItem ? items.push(updatedItem) : items[items.indexOf(oldItem)] = updatedItem
}

// todo use createEntityAdapter for the algorithms slice
export const algorithmsSlice = createSlice({
  name: 'algorithms',
  initialState: {
    get_all: {
      status: 'idle',
      error: ''
    },
    get: {
      status: 'idle',
      error: ''
    },
    create: {
      status: 'idle',
      error: ''
    },
    update: {
      status: 'idle',
      error: ''
    },
    delete: {
      status: 'idle',
      error: ''
    },
    delete_many: {
      status: 'idle',
      error: ''
    },
    list: [],
    messages: []
  },
  reducers: {
    addMessage: {
      reducer(state, action) {
        state.messages.push(action.payload)
      },
      // add an id to every message item that is added to the store
      prepare(messageItem){
        return{
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
  extraReducers: {
    [getAlgorithmsThunk.pending]: (state, action) => {
      state.get_all.status = 'loading'
    },
    [getAlgorithmsThunk.fulfilled]: (state, action) => {
      state.get_all.status = 'succeeded'
      // state.list = _.union(state.list, action.payload)
      state.list = action.payload
    },
    [getAlgorithmsThunk.rejected]: (state, action) => {
      state.get_all.status = 'failed'
      state.get_all.error = action.payload
    },

    [getAlgorithmThunk.pending]: (state, action) => {
      state.get.status = 'loading'
    },
    [getAlgorithmThunk.fulfilled]: (state, action) => {
      state.get.status = 'succeeded'
      // if the algorithm exist in the store update it with the latest server data, else add it
      updateItemsById(state.list, action.payload)
    },
    [getAlgorithmThunk.rejected]: (state, action) => {
      state.get.status = 'failed'
      state.get.error = action.payload
    },

    [createAlgorithmThunk.pending]: (state, action) => {
      state.create.status = 'loading'
    },
    [createAlgorithmThunk.fulfilled]: (state, action) => {
      state.create.status = 'succeeded'
      state.list.push(action.payload)
    },
    [createAlgorithmThunk.rejected]: (state, action) => {
      state.create.status = 'failed'
      // console.log("create thunk error:", action.error)
      // state.create.error = action.error.message
      // return rejectWithValue(errorPayload) causes the rejected action to use the errorPayload value as action.payload
      state.create.error = action.payload
    },
    [updateAlgorithmThunk.pending]: (state, action) => {
      state.update.status = 'loading'
    },
    [updateAlgorithmThunk.fulfilled]: (state, action) => {
      state.update.status = 'succeeded'
      state.list.map((algorithm, index, list_ref) => {
        if (algorithm.id === action.payload.id){
          list_ref[index] = action.payload
        }
      })
    },
    [updateAlgorithmThunk.rejected]: (state, action) => {
      state.update.status = 'failed'
      state.update.error = action.payload
    },
    [deleteAlgorithmThunk.pending]: (state, action) => {
      state.delete.status = 'loading'
    },
    [deleteAlgorithmThunk.fulfilled]: (state, action) => {
      state.delete.status = 'succeeded'
      const deletedItem = state.list.filter(item => item.id === action.payload)[0]
      const index = state.list.indexOf(deletedItem)
      state.list.splice(index, 1)
    },
    [deleteAlgorithmThunk.rejected]: (state, action) => {
      state.delete.status = 'failed'
      state.delete.error = action.payload
    },

    [deleteAlgorithmsThunk.pending]: (state, action) => {
      state.delete_many.status = 'loading'
    },
    [deleteAlgorithmsThunk.fulfilled]: (state, action) => {
      state.delete_many.status = 'succeeded'
      const deletedItems = state.list.filter(item => {
        // console.log(action.payload.ids, item.id, action.payload.ids.includes(item.id))
        return action.payload.ids.includes(item.id)
      })
      state.list = state.list.filter(item => !deletedItems.includes(item))
    },
    [deleteAlgorithmsThunk.rejected]: (state, action) => {
      state.delete_many.status = 'failed'
      state.delete_many.error = action.payload
    },
  }
})

export const algorithmsSelector = state => state.algorithms.list
export const algorithmsMessagesSelector = state => state.algorithms.messages
// export const getAllErrorSelector = state => state.algorithms.get_all.error
export const getAllStatusSelector = state => state.algorithms.get_all.status
// export const getErrorSelector = state => state.algorithms.get.error
export const getStatusSelector = state => state.algorithms.get.status
// export const createErrorSelector = state => state.algorithms.create.error
// export const createStatusSelector = state => state.algorithms.create.status
// export const updateStatusSelector = state => state.algorithms.update.status
// export const updateErrorSelector = state => state.algorithms.update.error
// export const deleteStatusSelector = state => state.algorithms.delete.status
// export const deleteErrorSelector = state => state.algorithms.delete.error
// export const deleteManyStatusSelector = state => state.algorithms.delete_many.status
// export const deleteManyErrorSelector = state => state.algorithms.delete_many.error

export const algorithmByIdSelector = (state, algorithmId) =>
  state.algorithms.list.filter(algorithm => algorithm.id === parseInt(algorithmId))[0]

export const algorithmBySlugSelector = (state, algorithmSlug) =>
  state.algorithms.list.filter(algorithm => algorithm.slug === algorithmSlug)[0]

export const {addMessage, markMessageSeen} = algorithmsSlice.actions

export default algorithmsSlice.reducer
