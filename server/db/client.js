import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(currentDir, '..', 'data')

fs.mkdirSync(dataDir, { recursive: true })

const databasePath = path.join(dataDir, 'sportspace.db')

export const db = new Database(databasePath)

db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')
