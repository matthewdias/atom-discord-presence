'use babel'

import { CompositeDisposable } from 'atom'
import RPC from 'discord-rpc'

export default class AtomDiscordPresence {
  subscriptions = new CompositeDisposable()
  rpc = new RPC.Client({ transport: 'ipc' })
  paused = false
  status = null
  loop = null
  timeout = null

  constructor() {
    let observeEditor = atom.workspace.observeActiveTextEditor(this.setupListeners)
    this.subscriptions.add(observeEditor)

    this.rpc.on('error', console.log)
    this.rpc.login({ clientId: '495442377931227136' })

    this.loop = setInterval(() => {
      if (!this.paused && this.status) {
        this.rpc.setActivity(this.status)
      } else {
        this.rpc.clearActivity()
      }
    }, 15000)
  }

  setupListeners = (editor) => {
    if (editor) {
      let bufferChange = editor.onDidChange(() => { this.setStatus(editor) })
      let cursorChange = editor.onDidChangeCursorPosition(() => { this.setStatus(editor) })

      this.subscriptions.add(bufferChange)
      this.subscriptions.add(cursorChange)
    }
  }

  setStatus = (editor) => {
    clearTimeout(this.timeout)
    let grammar = editor.getGrammar().name
    this.status = {
      details: grammar,
      largeImageKey: 'atom'
    }
    this.timeout = setTimeout(() => { this.status = null }, 60000)
  }

  deactivate = () => {
    this.subscriptions.dispose();
    clearInterval(this.loop)
  }
}
