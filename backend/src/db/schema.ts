import {
    pgTable,
    uuid,
    varchar,
    boolean,
    text,
    timestamp
} from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 100 }).notNull(),

    email: varchar("email", { length: 322 }).notNull(),
    emailVerified: boolean("email_verified").default(false),

    password: varchar("password", { length: 66 }).notNull(),
    salt: text("salt"),

    otp: varchar("otp", { length: 6 }),
    otpExpiry: timestamp("otp_expiry"),

    isDeleted: boolean("is_deleted").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date),
})


export const pollTable = pgTable("poll_table", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => userTable.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    isAnonymous: boolean("is_anonymous").default(false),
    expireTime: timestamp("expire_time").notNull(),
    isPublish: boolean("is_publish").default(false),
    isClosed: boolean("is_closed").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date),
})

export const questionTable = pgTable("question_table", {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id").notNull().references(() => pollTable.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    isMandatory: boolean("is_mandatory").default(false),
})

export const optionTable = pgTable("option_table", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id").notNull().references(() => questionTable.id, { onDelete: "cascade" }),
    option: text("option").notNull(),
})

export const responseTable = pgTable("response_table", {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id").notNull().references(() => pollTable.id, { onDelete: "cascade" }),

    userId: uuid("user_id").references(() => userTable.id, { onDelete: "cascade" }),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
})

export const answerTable = pgTable("answer_table", {
    id: uuid("id").primaryKey().defaultRandom(),

    responseId: uuid("response_id").notNull().references(() => responseTable.id, { onDelete: "cascade" }),

    optionId: uuid("option_id").references(() => optionTable.id, { onDelete: "cascade" }),

    textAnswer: text("text_answer"),

    questionId: uuid("question_id").notNull().references(() => questionTable.id, { onDelete: "cascade" }),
})