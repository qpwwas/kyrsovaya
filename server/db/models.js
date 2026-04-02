import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['admin', 'coach', 'athlete', 'parent'],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContact: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    athleteId: {
      type: String,
      default: null,
    },
    managedAthletes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: false,
  },
)

const participantSchema = new Schema(
  {
    _id: String,
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    focus: {
      type: String,
      required: true,
      trim: true,
    },
    sectionIds: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
  },
)

const sectionSchema = new Schema(
  {
    _id: String,
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    coach: {
      type: String,
      required: true,
      trim: true,
    },
    hall: {
      type: String,
      required: true,
      trim: true,
    },
    ageGroup: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    capacity: {
      type: Number,
      required: true,
    },
    scheduleSummary: {
      type: String,
      required: true,
      trim: true,
    },
    statusLabel: {
      type: String,
      required: true,
      trim: true,
    },
    statusTone: {
      type: String,
      required: true,
      trim: true,
    },
    participantIds: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
  },
)

const scheduleSchema = new Schema(
  {
    _id: String,
    sectionId: {
      type: String,
      required: true,
      trim: true,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    coach: {
      type: String,
      required: true,
      trim: true,
    },
    hall: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    statusLabel: {
      type: String,
      required: true,
      trim: true,
    },
    statusTone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  },
)

const attendanceSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    participantId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['present', 'late', 'absent'],
    },
  },
  {
    versionKey: false,
  },
)

attendanceSchema.index({ sessionId: 1, participantId: 1 }, { unique: true })

const achievementSchema = new Schema(
  {
    _id: String,
    participantId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  },
)

export const User = models.User ?? model('User', userSchema)
export const Participant =
  models.Participant ?? model('Participant', participantSchema)
export const Section = models.Section ?? model('Section', sectionSchema)
export const Schedule = models.Schedule ?? model('Schedule', scheduleSchema)
export const Attendance =
  models.Attendance ?? model('Attendance', attendanceSchema)
export const Achievement =
  models.Achievement ?? model('Achievement', achievementSchema)
