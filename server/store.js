const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'policies-store.json');

const defaultStore = () => ({
  policies: [],
  acknowledgements: [],
});

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultStore(), null, 2), 'utf8');
  }
}

function readStore() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.policies)) data.policies = [];
    if (!Array.isArray(data.acknowledgements)) data.acknowledgements = [];
    return data;
  } catch {
    return defaultStore();
  }
}

function writeStore(store) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function withStore(fn) {
  const store = readStore();
  const result = fn(store);
  writeStore(store);
  return result;
}

module.exports = {
  readStore,
  writeStore,
  withStore,
  DATA_FILE,
};
