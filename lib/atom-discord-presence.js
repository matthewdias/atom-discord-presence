'use babel'

import { CompositeDisposable } from 'atom'
import RPC from 'discord-rpc'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default class AtomDiscordPresence {
  subscriptions = new CompositeDisposable()
  rpc = null
  paused = false
  status = null
  loop = null
  timeout = null

  constructor() {
    let observeEditor = atom.workspace.observeActiveTextEditor(this.setupListeners)
    this.subscriptions.add(observeEditor)

    this.connectRPC()
  }

  connectRPC = async () => {
    try {
      this.rpc = new RPC.Client({ transport: 'ipc' })
      this.rpc.on('error', console.log)
      this.rpc.on('ready', this.update)
      await this.rpc.login({ clientId: '495442377931227136' })
    } catch (e) {
      await sleep(5000)
      this.connectRPC()
    }
  }

  update = () => {
    let response, prev
    this.loop = setInterval(async () => {
      if (!this.paused && this.status) {
        prev = this.status
        if (response != 'failed') {
          // setActivity never rejects so check if response was set last time
          response = 'failed'
          response = await this.rpc.setActivity(this.status)
        } else {
          clearInterval(this.loop)
          this.connectRPC()
        }
      } else {
        if (prev) {
          this.rpc.clearActivity()
        }
        prev = null
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
