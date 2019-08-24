import BaseCommand from 'Commands/_BaseCommand'
import YoutubeMp3Downloader from 'youtube-mp3-downloader'
import os from 'os'
import { statSync } from 'fs'
class Mp3Command extends BaseCommand{
  async setupCommand() {
    this.name = 'mp3'
    this.configFile = {
      property: 'config',
    }
    this.username = os.userInfo().username

    this.argsConfig = [
      {
        name: 'url',
        required: true,
        description: '影片網址',
      },
      {
        name: 'path',
        description: '下載路徑, 預設為桌面',
        defaultValue: `/home/${this.username}/Desktop`
      },
    ]
    this.description = `下載Mp3`
  }

  async start() {
    this.downloadPath = '/home/ciao/Desktop'
    try {
      this.videoUid = this.args.url.split('?v=')[1].split('&')[0]
    } catch (error) {
      log('影片網址錯誤', 'red')
      process.exit()
    }
    log(`開始下載(影片ID: ${this.videoUid})`, 'green')
    this.downloader = new YoutubeMp3Downloader({
      ffmpegPath: '/usr/bin/ffmpeg',
      outputPath: this.args.path,
      youtubeVideoQuality: 'highest',
      queueParallelism: 2,
      progressTimeout: 500,
    })

    this.downloader.download(this.videoUid)
    this.downloader.on('finished', (error, data) => this.handleFinished(error, data))
    this.downloader.on('progress', (progress) => this.handleProgress(progress))
    this.downloader.on('error', (error) => this.handleError(error))
  }

  handleFinished(error, data) {
    const filename = data.title
    const stats = statSync(data.file)
    const size = (stats['size']/1000000).toFixed(2)
    log(`下載完成(${filename})`, 'green')
    log(`檔案大小: ${size}MB`, 'green')

    if(error) {
      log(`錯誤: ${error}`, 'red')
    }
  }

  handleProgress(progress) {
    const percentage = progress.progress.percentage.toFixed(2)
    console.clear()
    log(`下載中(${percentage}%)`)
  }

  handleError(error) {
    log('下載失敗', 'red')
    log(JSON.stringify(error))
  }
}

export default new Mp3Command()