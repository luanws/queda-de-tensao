const { app, BrowserWindow, Menu, dialog } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: './img/icon.png',
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('windows/index.html');
  win.maximize();

  win.once('ready-to-show', () => {
    win.show();
  });

  win.once('closed', function () {
    win = null;
    process.exit();
  });
}

app.once('ready', () => {
  createWindow();

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { id: 'novo', label: 'Novo', click: () => { } },
        { id: 'abrir', label: 'Abrir' },
        { type: 'separator' },
        { id: 'salvar', label: 'Salvar' },
        { type: 'separator' },
        {
          label: 'Sair',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Desenvolvedor',
      submenu: [
        {
          role: 'toggledevtools'
        },
        {
          role: 'reload'
        }
      ]
    }
  ]));
});

app.once('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.once('activate', function () {
  if (win === null) createWindow();
});