import React, {useEffect} from "react"
import {useSelector, useDispatch} from "react-redux";
// import {algorithmsMessagesSelector, markMessageSeen} from "../algorithms/algorithmsSlice";
import {messagesSelector, markMessageSeen} from "src/features/Messages/messagesSlice";
import { useSnackbar } from 'notistack'

const Messages = () => {
  const dispatch = useDispatch()
  // const algorithmMessages = useSelector(state => algorithmsMessagesSelector(state))
  const genericMessages = useSelector(state => messagesSelector(state))
  const {enqueueSnackbar, closeSnackbar} = useSnackbar()

  useEffect(() => {
    const promise = showUnseenMessages()
  }, [genericMessages])

  const showUnseenMessages = () => {
    const unseenMessages = genericMessages.filter(message => !message.seen)
    for (const message of unseenMessages) {
      dispatch(markMessageSeen(message.id))
      enqueueSnackbar(message.text, {variant: message.mode})
    }
  }

  // showUnseenMessages()

  return null

}

export default Messages
