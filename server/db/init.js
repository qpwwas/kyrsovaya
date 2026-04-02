import bcrypt from 'bcryptjs'
import {
  initialAchievements,
  initialAttendanceRegisters,
  initialParticipants,
  initialProfiles,
  initialSchedule,
  initialSections,
} from '../../src/data/mockData.js'
import { db } from './client.js'

function migrateUsersSchema() {
  const usersTable = db
    .prepare(`
      SELECT sql
      FROM sqlite_master
      WHERE type = 'table' AND name = 'users'
    `)
    .get()

  if (!usersTable?.sql?.includes('role TEXT NOT NULL UNIQUE')) {
    return
  }

  db.pragma('foreign_keys = OFF')

  const migration = db.transaction(() => {
    db.exec(`
      ALTER TABLE parent_children RENAME TO parent_children_old;
      ALTER TABLE users RENAME TO users_old;

      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        emergency_contact TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        position TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        athlete_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (
        id,
        role,
        full_name,
        email,
        phone,
        emergency_contact,
        note,
        position,
        password_hash,
        athlete_id
      )
      SELECT
        id,
        role,
        full_name,
        email,
        phone,
        emergency_contact,
        note,
        position,
        password_hash,
        athlete_id
      FROM users_old;

      CREATE TABLE parent_children (
        user_id INTEGER NOT NULL,
        participant_id TEXT NOT NULL,
        PRIMARY KEY (user_id, participant_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      INSERT INTO parent_children (user_id, participant_id)
      SELECT user_id, participant_id
      FROM parent_children_old;

      DROP TABLE parent_children_old;
      DROP TABLE users_old;
    `)
  })

  migration()

  db.pragma('foreign_keys = ON')
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      emergency_contact TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      position TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      athlete_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parent_children (
      user_id INTEGER NOT NULL,
      participant_id TEXT NOT NULL,
      PRIMARY KEY (user_id, participant_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      level TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      focus TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      coach TEXT NOT NULL,
      hall TEXT NOT NULL,
      age_group TEXT NOT NULL,
      level TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      schedule_summary TEXT NOT NULL,
      status_label TEXT NOT NULL,
      status_tone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS section_participants (
      section_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      PRIMARY KEY (section_id, participant_id),
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      section_name TEXT NOT NULL,
      coach TEXT NOT NULL,
      hall TEXT NOT NULL,
      date_time TEXT NOT NULL,
      format TEXT NOT NULL,
      note TEXT NOT NULL,
      status_label TEXT NOT NULL,
      status_tone TEXT NOT NULL,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      session_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      status TEXT NOT NULL,
      PRIMARY KEY (session_id, participant_id),
      FOREIGN KEY (session_id) REFERENCES schedule(id) ON DELETE CASCADE,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT NOT NULL,
      FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
    );
  `)
}

function seedDatabase() {
  const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count

  if (usersCount > 0) {
    return
  }

  const insertUser = db.prepare(`
    INSERT INTO users (
      role,
      full_name,
      email,
      phone,
      emergency_contact,
      note,
      position,
      password_hash,
      athlete_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertParentChild = db.prepare(`
    INSERT INTO parent_children (user_id, participant_id)
    VALUES (?, ?)
  `)

  const insertParticipant = db.prepare(`
    INSERT INTO participants (id, name, age, level, parent_name, focus)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertSection = db.prepare(`
    INSERT INTO sections (
      id,
      name,
      description,
      coach,
      hall,
      age_group,
      level,
      tags_json,
      capacity,
      schedule_summary,
      status_label,
      status_tone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertSectionParticipant = db.prepare(`
    INSERT INTO section_participants (section_id, participant_id)
    VALUES (?, ?)
  `)

  const insertSchedule = db.prepare(`
    INSERT INTO schedule (
      id,
      section_id,
      section_name,
      coach,
      hall,
      date_time,
      format,
      note,
      status_label,
      status_tone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertAttendance = db.prepare(`
    INSERT INTO attendance (session_id, participant_id, status)
    VALUES (?, ?, ?)
  `)

  const insertAchievement = db.prepare(`
    INSERT INTO achievements (id, participant_id, title, details)
    VALUES (?, ?, ?, ?)
  `)

  const seedTransaction = db.transaction(() => {
    for (const [role, profile] of Object.entries(initialProfiles)) {
      const passwordHash = bcrypt.hashSync(profile.password, 10)
      const result = insertUser.run(
        role,
        profile.fullName,
        profile.email,
        profile.phone,
        profile.emergencyContact,
        profile.note,
        profile.position,
        passwordHash,
        profile.athleteId ?? null,
      )

      if (profile.managedAthletes?.length) {
        for (const participantId of profile.managedAthletes) {
          insertParentChild.run(result.lastInsertRowid, participantId)
        }
      }
    }

    for (const participant of initialParticipants) {
      insertParticipant.run(
        participant.id,
        participant.name,
        participant.age,
        participant.level,
        participant.parentName,
        participant.focus,
      )
    }

    for (const section of initialSections) {
      insertSection.run(
        section.id,
        section.name,
        section.description,
        section.coach,
        section.hall,
        section.ageGroup,
        section.level,
        JSON.stringify(section.tags),
        section.capacity,
        section.scheduleSummary,
        section.statusLabel,
        section.statusTone,
      )

      for (const participantId of section.participantIds) {
        insertSectionParticipant.run(section.id, participantId)
      }
    }

    for (const session of initialSchedule) {
      insertSchedule.run(
        session.id,
        session.sectionId,
        session.sectionName,
        session.coach,
        session.hall,
        session.dateTime,
        session.format,
        session.note,
        session.statusLabel,
        session.statusTone,
      )
    }

    for (const register of initialAttendanceRegisters) {
      for (const mark of register.marks) {
        insertAttendance.run(register.sessionId, mark.participantId, mark.status)
      }
    }

    for (const achievement of initialAchievements) {
      insertAchievement.run(
        achievement.id,
        achievement.participantId,
        achievement.title,
        achievement.details,
      )
    }
  })

  seedTransaction()
}

export function ensureDatabaseReady() {
  migrateUsersSchema()
  createTables()
  seedDatabase()
}
