import { relations } from "drizzle-orm"
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { organization } from "@workspace/db/schema/auth"
import { type TaskStatus, taskStatusValues } from "@workspace/shared/api/tasks"

export const taskStatus = pgEnum("task_status", taskStatusValues)

export const task = pgTable(
  "task",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatus("status").$type<TaskStatus>().default("todo").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("task_organizationId_idx").on(table.organizationId),
    index("task_status_idx").on(table.status),
  ]
)

export const taskOrganizationRelations = relations(
  organization,
  ({ many }) => ({
    tasks: many(task),
  })
)

export const taskRelations = relations(task, ({ one }) => ({
  organization: one(organization, {
    fields: [task.organizationId],
    references: [organization.id],
  }),
}))
