import AppKernel from 'AppKernel'
import Mp3Command from 'Commands/Mp3Command'
class App extends AppKernel {
  setup() {
    this.commandList = [
      Mp3Command,
    ]
  }
}

const app = new App()
app.start()