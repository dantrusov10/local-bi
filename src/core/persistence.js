import { openDB } from 'idb'

const DB_NAME = 'newlevel-bi'
const STORE = 'appState'

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
  })
}

export async function saveState(key, value) {
  const db = await getDb()
  return db.put(STORE, value, key)
}

export async function loadState(key) {
  const db = await getDb()
  return db.get(STORE, key)
}
