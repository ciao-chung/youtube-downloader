import 'Global'
import jsYaml from 'js-yaml'
import { extname, resolve } from 'path'
import { readFileSync } from 'fs'
class AppKernel {
  async setup() {
    this.commandList = []
  }

  async start() {
    this.setup()
    log('app start')
    this.error = []
    this.commands = {}
    this.commandList.forEach(command => {
      command.setupCommand()
      this.commands[command.name] = command
    })

    const command = this.validate()
    await command.beforeStart()
    await command.start()
  }

  validate() {
    const command = this.commands[args.command]
    if(!command) {
      log(`Command not found.`, 'red')
      this._showAllCommands()
      process.exit()
      return
    }

    // show command help
    if(this._isHelpMode()) {
      return this._showCommandHelp(command)
    }

    // setup config file
    if(command.configFile) {
      this._setupConfigFile(command)
    }

    const self = this
    command.argsConfig.forEach(argConfig => {
      self._validateArg(command, argConfig)
    })

    if(this.error.length == 0) return command
    let errorMessage = ''
    this.error.forEach(error => errorMessage += `${error.error}\n`)
    log(errorMessage, 'red')
    process.exit()
  }

  _setupConfigFile(command) {
    if(typeof command.configFile != 'object') return
    const configArgName = command.configFile.property || 'config'
    const configFilePath = resolve(args[configArgName])
    const configFileType = extname(configFilePath)
    if(configFileType != '.json' && configFileType != '.yml') {
      log(`Config file only support json/yaml format`, 'red')
      process.exit()
    }

    let configFileContent = ''
    try {
      configFileContent = readFileSync(configFilePath, 'utf8')
      configFileContent = configFileType == '.json'
          ? JSON.parse(configFileContent)
          : jsYaml.safeLoad(configFileContent)
    } catch (error) {
      log(error, 'red')
      process.exit()
    }

    command.commandConfig = configFileContent
  }

  _validateArg(command, argConfig) {
    const argName = argConfig.name
    let argValue

    switch (argConfig.type) {
      case 'boolean':
        argValue = !!args[argName]
        break
      case 'number':
        argValue = Number(args[argName])
        if(isNaN(argValue)) argValue = 0
        break
      case 'array':
        argValue = !args[argName] ? [] : String(args[argName]).split(',')
        break
      default:
        argValue = !args[argName] ? '' : String(args[argName])
    }

    // validate require
    if(argConfig.required == true) {
      if(argValue === null || argValue === undefined || argValue === '') {
        this.error.push({
          error: `Argument ${argName} is required.`
        })
        return
      }
    }

    argValue = this.setDefaultValueIfEmpty(argValue, argConfig)
    command.args[argName] = argValue
  }

  setDefaultValueIfEmpty(value, argConfig) {
    const defaultValue = argConfig.defaultValue
    const type = argConfig.type
    if(!defaultValue) return value

    if(type == 'array') {
      if(value.length == 0) return defaultValue.split(',')
    }

    if(type == 'number') {
      if(!value) return defaultValue
    }

    if(value) return value
    return defaultValue
  }

  _isHelpMode() {
    if(!!args.h) return true
    if(!!args.help) return true
    return false
  }

  _showAllCommands() {
    let result = 'Command List\n'
    for(const index in this.commands) {
      const command = this.commands[index]
      result += `${command.name} \t\t\t ${command.description}\n\n`
    }
    log(result)
  }

  _showCommandHelp(command) {
    log(`Command: ${command.name}`, 'yellow')
    log(`Description: ${command.description}`, 'yellow')
    for(const argConfig of command.argsConfig) {
      let result = ``
      const requiredMessage = argConfig.required == true ? '/required' : ''
      const type = !argConfig.type ? 'string' : argConfig.type
      result += `[${argConfig.name}]\t\t ${type}${requiredMessage}\t\t`
      log(result)
      log(`${argConfig.description} \n${'-'.repeat(40)}`)
    }
    process.exit()
  }
}

export default AppKernel