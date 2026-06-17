import { defineField, defineType } from "sanity";

export const staffEmailActivityLog = defineType({
  name: "staffEmailActivityLog",
  title: "Staff Email Activity Log",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "action",
      title: "Action",
      type: "string",
      options: {
        list: [
          { title: "Created", value: "created" },
          { title: "Updated", value: "updated" },
          { title: "Activated", value: "activated" },
          { title: "Deactivated", value: "deactivated" },
          { title: "Deleted", value: "deleted" },
        ],
      },
    }),
    defineField({ name: "accountId", title: "Account ID", type: "string" }),
    defineField({ name: "accountEmail", title: "Account Email", type: "string" }),
    defineField({ name: "accountName", title: "Account Name", type: "string" }),
    defineField({ name: "performedBy", title: "Performed By", type: "string" }),
    defineField({
      name: "performedByRole",
      title: "Performed By Role",
      type: "string",
    }),
    defineField({ name: "timestamp", title: "Timestamp", type: "datetime" }),
    defineField({ name: "details", title: "Details", type: "text", rows: 2 }),
  ],
  preview: {
    select: {
      title: "action",
      subtitle: "accountEmail",
      description: "performedBy",
    },
  },
});
