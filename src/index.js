import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import Datastore from 'nedb';
import { exec } from 'child_process'; // For running PowerShell commands
import si from 'systeminformation';
import axios from 'axios';


// Get the current directory of the module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the user database
const db = new Datastore({ filename: path.join(__dirname, 'database', 'users.db'), autoload: true });

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Set to full screen after the window is created
  win.setFullScreen(true);

  const startPage = 'login.html'; // Assuming you always want to start with the login page
  win.loadFile(path.join(__dirname, startPage));
};

// Handle app lifecycle
app.whenReady().then(() => {
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

// Handle login request from renderer
ipcMain.handle('check-user', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.findOne({ username }, (err, user) => {
      if (err) {
        reject({ code: 500, message: 'Internal server error' });
      } else if (!user || user.password !== password) {
        resolve({ success: false, message: 'Invalid credentials' });
      } else {
        resolve({ success: true, username });
      }
    });
  });
});

// Handle user registration request
ipcMain.handle('register-user', async (event, { username, email, password }) => {
  return new Promise((resolve, reject) => {
    db.findOne({ email }, (err, user) => {
      if (err) {
        reject({ code: 500, message: 'Internal server error' });
      } else if (user) {
        resolve({ success: false, message: 'User with this email already exists' });
      } else {
        db.insert({ username, email, password }, (err, newDoc) => {
          if (err) {
            reject({ code: 500, message: 'Internal server error' });
          } else {
            resolve({ success: true, message: 'Registration successful' });
          }
        });
      }
    });
  });
});

// Handle network scan request
ipcMain.on('start-network-scan', (event) => {
  const session = ping.createSession();
  const devices = [];
  const networkRange = '192.168.1.1-255'; // Adjust based on your network

  session.pingHost(networkRange, function (error, target) {
    if (error) {
      console.log(target + ": " + error.toString());
    } else {
      devices.push({ ip: target, host: target });
    }
  });

  event.sender.send('network-scan-results', devices);
});

// Handle PowerShell command execution
ipcMain.on('run-powershell-command', (event, command) => {
  exec(`powershell ${command}`, (error, stdout, stderr) => {
    if (error) {
      event.sender.send('powershell-output', `Error: ${error.message}`);
      return;
    }
    if (stderr) {
      event.sender.send('powershell-output', `stderr: ${stderr}`);
      return;
    }
    event.sender.send('powershell-output', stdout);
  });
});

ipcMain.handle('get-system-info', async () => {
  try {
    const cpu = await si.cpu();
    const memory = await si.mem();
    const os = await si.osInfo();
    const disk = await si.diskLayout();

    return {
      cpu: cpu,
      memory: memory,
      os: os,
      disk: disk
    };
  } catch (error) {
    console.error("Error fetching system info: ", error);
    return { error: "Could not fetch system information" };
  }
});

ipcMain.handle('get-ip-location', async () => {
  try {
    const response = await axios.get('https://ipinfo.io/json?token=YOUR_TOKEN');
    return response.data;
  } catch (error) {
    console.error("Error fetching IP location:", error);
    return { error: "Could not fetch IP location" };
  }
});