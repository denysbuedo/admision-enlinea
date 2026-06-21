import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Users table - supports all roles
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["super_admin", "university", "aspirant"] }).notNull().default("aspirant"),
  universityId: integer("university_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Universities table
export const universities = sqliteTable("universities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  faculty: text("faculty"),
  country: text("country"),
  city: text("city"),
  website: text("website"),
  logoUrl: text("logo_url"),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Programs table
export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  universityId: integer("university_id").notNull(),
  // General Info
  title: text("title").notNull(),
  programType: text("program_type", { enum: ["curso", "diplomado", "especializacion", "maestria", "doctorado"] }).notNull(),
  modality: text("modality", { enum: ["presencial", "virtual", "hibrido"] }).notNull(),
  duration: text("duration"),
  language: text("language").notNull().default("Español"),
  location: text("location"),
  credits: integer("credits"),
  description: text("description"),
  // Key Dates
  openDate: integer("open_date", { mode: "timestamp" }),
  deadlineDate: integer("deadline_date", { mode: "timestamp" }),
  resultsDate: integer("results_date", { mode: "timestamp" }),
  startDate: integer("start_date", { mode: "timestamp" }),
  // Eligibility
  minDegree: text("min_degree"),
  minGpa: real("min_gpa"),
  professionalExperience: text("professional_experience"),
  languageRequirements: text("language_requirements"),
  eligibilityNotes: text("eligibility_notes"),
  // Required Documents (JSON array)
  requiredDocuments: text("required_documents"),
  // Financial Info
  totalCost: real("total_cost"),
  currency: text("currency").default("USD"),
  paymentMethods: text("payment_methods"),
  scholarshipsAvailable: integer("scholarships_available", { mode: "boolean" }).default(false),
  scholarshipsInfo: text("scholarships_info"),
  refundPolicy: text("refund_policy"),
  // Selection Process
  selectionProcess: text("selection_process"),
  hasInterview: integer("has_interview", { mode: "boolean" }).default(false),
  hasExam: integer("has_exam", { mode: "boolean" }).default(false),
  // Legal
  privacyPolicy: text("privacy_policy"),
  termsConditions: text("terms_conditions"),
  // Status
  status: text("status", { enum: ["draft", "pending_approval", "published", "closed", "rejected"] }).notNull().default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Applications table
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id").notNull(),
  userId: integer("user_id").notNull(),
  // Section 1: Personal Info
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthDate: integer("birth_date", { mode: "timestamp" }),
  nationality: text("nationality"),
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  phone: text("phone"),
  email: text("email"),
  // Section 2: Academic Info (JSON)
  academicInfo: text("academic_info"),
  // Section 3: Professional Experience (JSON array)
  professionalExperience: text("professional_experience"),
  // Section 4: Complementary Info (JSON)
  complementaryInfo: text("complementary_info"),
  // Section 6: Declaration
  declarationAccepted: integer("declaration_accepted", { mode: "boolean" }).default(false),
  dataProcessingAccepted: integer("data_processing_accepted", { mode: "boolean" }).default(false),
  digitalSignature: text("digital_signature"),
  // Status
  status: text("status", { enum: ["draft", "submitted", "under_review", "interview", "approved", "rejected", "waitlisted"] }).notNull().default("draft"),
  reviewNotes: text("review_notes"),
  score: real("score"),
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Documents table
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type", { enum: ["cv", "degree", "transcript", "motivation_letter", "recommendation_letter", "id_document", "portfolio", "other"] }).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  applicationId: integer("application_id"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Status History table
export const statusHistory = sqliteTable("status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: integer("changed_by").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
