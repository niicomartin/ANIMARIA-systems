const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function cargarEnv() {
  const envPath = path.join(app.getAppPath(), ".env");

  if (!fs.existsSync(envPath)) return;

  const env = fs.readFileSync(envPath, "utf8");

  env.split("\n").forEach((line) => {
    const clean = line.trim();

    if (!clean || clean.startsWith("#")) return;

    const [key, ...value] = clean.split("=");

    process.env[key] = value.join("=");
  });
}

function iniciarNext() {
  process.env.NODE_ENV = "production";
  process.env.PORT = "3000";
  process.env.HOSTNAME = "127.0.0.1";

  cargarEnv();

  const serverPath = path.join(
    app.getAppPath(),
    ".next",
    "standalone",
    "server.js",
  );

  require(serverPath);
}

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 750,
    title: "ANIMARIA",
    icon: path.join(app.getAppPath(), "build", "icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setTimeout(() => {
    mainWindow.loadURL("http://127.0.0.1:3000");
  }, 2500);
}

app.whenReady().then(() => {
  iniciarNext();
  crearVentana();
});

app.on("window-all-closed", () => {
  app.quit();
});