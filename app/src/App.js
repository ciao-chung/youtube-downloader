import AppKernel from 'AppKernel'
import ExampleCommand from 'Commands/ExampleCommand'
class App extends AppKernel {
  setup() {
    this.commandList = [
      ExampleCommand,
    ]
  }
}

const app = new App()
app.start()