const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();

let win = null;

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
});

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png') 
  });

  win.loadFile('index.html');

  // --- CORREÇÃO DA TELA BRANCA ---
  // Isso intercepta qualquer clique em link (target=_blank) ou download
  // e força abrir no Chrome/Edge do usuário, impedindo a janela branca do Electron.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' }; // 'deny' impede a janela branca de abrir
  });
}

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) return;
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
