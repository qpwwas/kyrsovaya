import bcrypt from 'bcryptjs'
import {
  initialAchievements,
  initialAttendanceRegisters,
  initialParticipants,
  initialProfiles,
  initialSchedule,
  initialSections,
} from '../../src/data/mockData.js'
import { connectToDatabase } from './client.js'
import {
  Achievement,
  Attendance,
  Participant,
  Schedule,
  Section,
  User,
} from './models.js'

async function seedDatabase() {
  const usersCount = await User.countDocuments()

  if (usersCount > 0) {
    return
  }

  const users = []

  for (const [role, profile] of Object.entries(initialProfiles)) {
    users.push({
      role,
      fullName: profile.fullName,
      email: profile.email.toLowerCase(),
      phone: profile.phone,
      emergencyContact: profile.emergencyContact,
      note: profile.note,
      position: profile.position,
      passwordHash: bcrypt.hashSync(profile.password, 10),
      athleteId: profile.athleteId ?? null,
      managedAthletes: profile.managedAthletes ?? [],
    })
  }

  const participants = initialParticipants.map((participant) => ({
    _id: participant.id,
    name: participant.name,
    age: participant.age,
    level: participant.level,
    parentName: participant.parentName,
    focus: participant.focus,
    sectionIds: participant.sectionIds ?? [],
  }))

  const sections = initialSections.map((section) => ({
    _id: section.id,
    name: section.name,
    description: section.description,
    coach: section.coach,
    hall: section.hall,
    ageGroup: section.ageGroup,
    level: section.level,
    tags: section.tags ?? [],
    capacity: section.capacity,
    scheduleSummary: section.scheduleSummary,
    statusLabel: section.statusLabel,
    statusTone: section.statusTone,
    participantIds: section.participantIds ?? [],
  }))

  const schedule = initialSchedule.map((session) => ({
    _id: session.id,
    sectionId: session.sectionId,
    sectionName: session.sectionName,
    coach: session.coach,
    hall: session.hall,
    dateTime: session.dateTime,
    format: session.format,
    note: session.note,
    statusLabel: session.statusLabel,
    statusTone: session.statusTone,
  }))

  const attendance = initialAttendanceRegisters.flatMap((register) =>
    register.marks.map((mark) => ({
      sessionId: register.sessionId,
      participantId: mark.participantId,
      status: mark.status,
    })),
  )

  const achievements = initialAchievements.map((achievement) => ({
    _id: achievement.id,
    participantId: achievement.participantId,
    title: achievement.title,
    details: achievement.details,
  }))

  await Promise.all([
    User.insertMany(users),
    Participant.insertMany(participants),
    Section.insertMany(sections),
    Schedule.insertMany(schedule),
    Attendance.insertMany(attendance),
    Achievement.insertMany(achievements),
  ])
}

export async function ensureDatabaseReady() {
  await connectToDatabase()
  await seedDatabase()
}
