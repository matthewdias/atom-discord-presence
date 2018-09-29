'use babel'

import AtomDiscordPresence from './atom-discord-presence'

export default {
  singleton: null,

  activate() {
    this.singleton = new AtomDiscordPresence()
  },

  deactivate() {
    this.singleton.deactivate()
  }
}
