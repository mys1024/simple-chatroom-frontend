import { For, Show, createEffect, createSignal, untrack } from 'solid-js'
import { createStore } from 'solid-js/store'

import type { Message } from '~/types'
import { ignoreErrorSync, isMessage } from '~/utils'
import { WS_BASE_URL } from '~/config'

let history: HTMLDivElement
const [ws, setWs] = createSignal<WebSocket | undefined>()
const [chatroom, setChatroom] = createSignal('')
const [nickname, setNickname] = createSignal('')
const [text, setText] = createSignal('')
const [store, setStore] = createStore<{ messages: Message[] }>({ messages: [] })

function addMessage(msg: Message) {
  setStore('messages', messages => [...messages, msg])
  history.scrollTo({ top: 1e12, behavior: 'smooth' })
}

function clearMessages() {
  setStore('messages', () => [])
}

function onMessage(evt: MessageEvent) {
  const data = evt.data
  // check
  if (typeof data !== 'string')
    return
  const msg = ignoreErrorSync(() => JSON.parse(data))
  if (!isMessage(msg))
    return
  // handle message
  addMessage(msg)
}

function onSendBtnClick() {
  const socket = ws()
  if (!socket)
    return
  const msg = { sender: nickname(), body: text() }
  addMessage(msg)
  socket.send(JSON.stringify(msg))
}

createEffect(() => {
  untrack(() => {
    if (ws())
      ws().close()
  })
  if (!chatroom())
    return
  clearMessages()
  const newWs = new WebSocket(`${WS_BASE_URL}/${chatroom()}`)
  newWs.onmessage = onMessage
  setWs(newWs)
})

export default () => {
  return (
    <div
      h-full w="full md:7/10 lg:5/10 xl:4/10" p-4 mx-auto
      text-white font-mono
      space-y-4 flex flex-col items-center
    >
      {/* title */}
      <h1 py-4 text-3xl>
        <a href="https://github.com/mys1024/simple-chatroom-frontend">
          Simple Chatroom
        </a>
      </h1>
      {/* chatroom */}
      <input
        w="full md:8/10 lg:7/10 xl:5/10" input-text
        placeholder='Chatroom'
        value={chatroom()}
        onChange={e => setChatroom((e.target as HTMLInputElement).value)}
      />
      {/* chatroom body */}
      <Show when={ws() && chatroom()}>
        {/* history messages */}
        <div
          flex-grow w-full p-4
          bg-dark rounded space-y-2 overflow-auto
          ref={history}
        >
          <For each={store.messages}>
            {
              msg => <div>{msg.sender || '(Anon)'}: {msg.body}</div>
            }
          </For>
        </div>
        {/* new message */}
        <div w="full md:8/10 lg:7/10 xl:5/10" space-y-2 flex flex-col items-center>
          {/* nickname */}
          <input
            w-full input-text
            placeholder='Nickname'
            value={nickname()}
            onChange={e => setNickname((e.target as HTMLInputElement).value)}
          />
          <input
            w-full input-text
            placeholder='Message'
            value={text()}
            onInput={e => setText((e.target as HTMLInputElement).value)}
          />
          <button btn-text select-none onClick={onSendBtnClick}>
            Send
          </button>
        </div>
      </Show>
    </div>
  )
}
