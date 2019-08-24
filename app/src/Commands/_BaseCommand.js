class _BaseCommand {
  constructor() {
    this._init()
  }

  /**
   * Init command
   */
  async _init() {
    this.name = ''
    this.configFile = null
    this.options = []
    this.args = {}
    this.argsConfig = []
    this.description = 'This is default description of command.'
  }

  async setupCommand() {

  }

  /**
   * Before command start
   * You can do something here before command start
   */
  async beforeStart() {}

  /**
   * Start command
   */
  async start() {}
}

export default _BaseCommand