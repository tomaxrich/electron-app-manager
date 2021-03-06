import path from 'path'
import fs from 'fs'
import { app, BrowserWindow } from 'electron'
import AppManager from '../../AppManager';
import { IRelease } from '../../api/IRelease';

function createWindow(options : any, data = {}) {

  const preloadPath = path.join(__dirname, 'preload.js')

  let baseOptions = {
    width: 800, 
    height: 600 
  }

  let popupOptions = {
    // parent: win, // The child window will always show on top of the top window.
    modal: true
  }

  if(!fs.existsSync(preloadPath)){
    throw new Error('for security reasons application cannot be started without preload script - path does not exist: '+preloadPath)
  }

  // don't make any changes here
  let enforcedOptions = {
    webPreferences: {
      // https://electronjs.org/docs/tutorial/security#3-enable-context-isolation-for-remote-content
      contextIsolation: true,
      preload: preloadPath,
      // https://electronjs.org/docs/tutorial/security#2-disable-nodejs-integration-for-remote-content
      nodeIntegration: false,
      // https://electronjs.org/docs/tutorial/security#5-do-not-disable-websecurity
      webSecurity: true,
      // https://electronjs.org/docs/tutorial/security#7-do-not-set-allowrunninginsecurecontent-to-true
      allowRunningInsecureContent: false,
      // https://electronjs.org/docs/tutorial/security#8-do-not-enable-experimental-features
      experimentalFeatures: false,
      webviewTag: true, // needs to be set: defaults to nodeIntegration otherwise
      // https://electronjs.org/docs/tutorial/security#9-do-not-use-enableblinkfeatures
      enableBlinkFeatures: undefined, // DO NOT USE
    }
  }

  // avoid potentially immutable or non-overwritable values on the passed options
  if(options && options.webPreferences){
    delete options.webPreferences
    // TODO alert 
  }

  let config = Object.assign(baseOptions, options)

  let isPopup = false
  if(isPopup){
    config = Object.assign(config, popupOptions)
  }

  // must be last call to assign values to config - should overwrite existing values
  const windowConfig = Object.assign(config, enforcedOptions)

  let win = new BrowserWindow(windowConfig)

  // pass initial data to window
  // @ts-ignore
  win.data = JSON.stringify(data) 

  // @ts-ignore
  win.update = changes => {
    win.webContents.send('__update', {
      ...changes
    })
  }
  
  return win

}

interface AppInfo {
  name: string;
  version: string;
}

export const createSplash = (appInfo : IRelease | AppInfo = { name: '', version: ''}, indexHtml = path.join(__dirname, 'splash.html')) => {
  const {name, version} = appInfo
  let splash : any = null
  splash = createWindow({
    width: 500,
    height: 275,
    frame: false
  }, {
    name,
    version,
    progress: 0
  })

  // TODO make sure indexHtml exists
  splash.loadFile(indexHtml)

  return splash
}

export function showSplash(appUpdater : AppManager, release? : IRelease, indexHtml = path.join(__dirname, 'splash.html')){

  let appInfo  : IRelease | AppInfo = release || {
    name: appUpdater.repository,
    version: 'Latest'
  }

  let splash : any;

  if(app.isReady()) {
    splash = createSplash(appInfo)
  } else {
    app.once('ready', () => {
      splash = createSplash(appInfo)
    })
  }

  const updateSplash = (app : any, progress : any) => {
    if(!splash) return 
    splash.update({
      app,
      progress
    })
  }

  // FIXME call closeSPlash when x is pressed in UI
  const closeSplash = () => {
    if(!splash) return 
    setTimeout(() => {
      appUpdater.removeListener('update-progress', updateSplash)
      appUpdater.removeListener('update-downloaded', closeSplash)
      splash.close()
      splash = null
    }, 1000)
  }

  appUpdater.on('update-progress', updateSplash)
  appUpdater.on('update-downloaded', closeSplash)

  return {
    setRelease: () => {
      console.log('set release!')
    }
  }
}

