const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const gltfToGlb = gltfPipeline.gltfToGlb;
const glbToGltf = gltfPipeline.glbToGltf;
const processGltf = gltfPipeline.processGltf;

function createWindow () {
  const win = new BrowserWindow({
    width: 375,
    height: 690,
    titleBarStyle: 'hidden',
    maximizable: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: __dirname + '/icon.icns'
  })
  // win.webContents.openDevTools()
  win.setIcon(path.join(__dirname, '/icon.png'));
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const exec = require('child_process').exec;
var executablePath = path.join(__dirname, "FBX2glTF")

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
};

//electron application codes
ipcMain.on('ondragstart', (event, filePath, option, dracoOption) => {
  console.log(filePath)
  const file_name =  filePath.replace('.'+filePath.split('.').pop(),'');

  switch (option) {
    case 1:
      execute(`${executablePath} --binary --draco --verbose --input ${filePath} --output ${file_name}.glb`, (output) => {
        // console.log('ok')
        event.sender.send('convertdone')
      })
      break;
    case 2:
      //glb to gltf
      const glb = fsExtra.readFileSync(filePath);
      glbToGltf(glb)
      .then(function(results) {
          fsExtra.writeJsonSync(`${file_name}.gltf`, results.gltf);
          event.sender.send('convertdone')
      })
      .catch(err => {
        console.log(err)
        event.sender.send('converterror')
      });
      break;
    case 3:
      //glTF to glb
      const gltf = fsExtra.readJsonSync(filePath);
      gltfToGlb(gltf)
      .then(function(results) {
          fsExtra.writeFileSync(`${file_name}.glb`, results.glb);
          event.sender.send('convertdone')
      })
      .catch(err => {
        console.log(err)
        event.sender.send('converterror')
      });
      break;
    case 4:
      const gltf2 = fsExtra.readJsonSync(filePath);
      const options = {
          // dracoOptions: {
              compressionLevel: parseInt(dracoOption.compressionLevel),
              compressMeshes: dracoOption.compressMeshes == 'true'
          // }
      };
      console.log(options)
      processGltf(gltf2, options)
      .then(function(results) {
          fsExtra.writeJsonSync(`${file_name}-draco.gltf`, results.gltf);
          event.sender.send('convertdone')
      })
      .catch(err => {
        console.log(err)
        event.sender.send('converterror')
      });
      break;
  }
})