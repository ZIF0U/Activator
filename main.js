const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Generate or load RSA keys
let privateKey, publicKey;
const keyPath = path.join(__dirname, 'keys');
if (!fs.existsSync(keyPath)) fs.mkdirSync(keyPath);
const pubKeyFile = path.join(keyPath, 'public.pem');
const privKeyFile = path.join(keyPath, 'private.pem');

if (fs.existsSync(pubKeyFile) && fs.existsSync(privKeyFile)) {
  publicKey = fs.readFileSync(pubKeyFile, 'utf8');
  privateKey = fs.readFileSync(privKeyFile, 'utf8');
} else {
  const keyPair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
  publicKey = keyPair.publicKey;
  privateKey = keyPair.privateKey;
  fs.writeFileSync(pubKeyFile, publicKey);
  fs.writeFileSync(privKeyFile, privateKey);
}

ipcMain.handle('generate-code', async (event, deviceId) => {
  try {
    const payload = { deviceId, issuedAt: Date.now() };
    const payloadJson = JSON.stringify(payload);
    const payloadB64 = Buffer.from(payloadJson).toString('base64');

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(payloadB64);
    const signature = signer.sign(privateKey, 'base64');

    const code = `${payloadB64}.${signature}`;
    return { success: true, code, publicKey };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
