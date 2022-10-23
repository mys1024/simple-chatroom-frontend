import { For, Show, createEffect, createSignal, untrack } from 'solid-js'
import { createStore } from 'solid-js/store'

import type { Message } from '~/types'
import { ignoreErrorSync, isMessage } from '~/utils'
import { WS_BASE_URL } from '~/config'

const [ws, setWs] = createSignal<WebSocket | undefined>()
const [chatroom, setChatroom] = createSignal('')
const [nickname, setNickname] = createSignal('')
const [text, setText] = createSignal('')
const [store, setStore] = createStore<{ messages: Message[] }>({ messages: [] })

function addMessage(msg: Message) {
  setStore('messages', messages => [...messages, msg])
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
      min-h-100vh
      bg="#282c34"
      text-white
    >
      <main p-12 space-y-4>
        {/* chatroom and nickname */}
        <div space-y-2>
          <div>
            <input
              text-black
              placeholder='Chatroom'
              value={chatroom()}
              onChange={e => setChatroom((e.target as HTMLInputElement).value)}
            />
          </div>
          <div>
            <input
              text-black
              placeholder='Nickname'
              value={nickname()}
              onChange={e => setNickname((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <Show when={ws() && chatroom()}>
          {/* messages */}
          <div h-100 overflow-auto>
            <For each={store.messages}>
              {
                msg => <div>{msg.sender || '(Anon)'}: {msg.body}</div>
              }
            </For>
          </div>
          {/* send */}
          <div text-black space-x-2>
            <input
              placeholder='Message'
              value={text()}
              onInput={e => setText((e.target as HTMLInputElement).value)}
            />
            <button
              px-2
              bg-white
              onClick={onSendBtnClick}
            >
              Send
            </button>
          </div>
        </Show>
      </main>
    </div>
  )
}
