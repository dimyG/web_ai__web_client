import React, {useEffect} from "react"
import {useSelector, useDispatch} from "react-redux";
import {messagesSelector, markMessageSeen} from "../features/algorithms/algorithmsSlice";
import { useSnackbar } from 'notistack'

const Messages = () => {
  const dispatch = useDispatch()
  const algorithmMessages = useSelector(state => messagesSelector(state))
  const {enqueueSnackbar, closeSnackbar} = useSnackbar()

  useEffect(() => {
    const promise = showUnseenMessages()
  }, [algorithmMessages])

  const showUnseenMessages = () => {
    const unseenMessages = algorithmMessages.filter(message => !message.seen)
    for (const message of unseenMessages) {
      dispatch(markMessageSeen(message.id))
      enqueueSnackbar(message.text, {variant: message.mode})
    }
  }

  // showUnseenMessages()

  return null

}

export default Messages
