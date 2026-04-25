import { relations } from "drizzle-orm"
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { account, session, user } from "@workspace/db/schema/auth"
import { type TaskStatus, taskStatusValues } from "@workspace/shared/api/tasks"

export const taskStatus = pgEnum("task_status", taskStatusValues)

export const task = pgTable(
  "task",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatus("status").$type<TaskStatus>().default("todo").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("task_userId_idx").on(table.userId),
    index("task_status_idx").on(table.status),
  ]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  tasks: many(task),
}))

export const taskRelations = relations(task, ({ one }) => ({
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
}))
