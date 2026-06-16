import { defineField, defineType } from "sanity";

export const staffEmailAccount = defineType({
  name: "staffEmailAccount",
  title: "Staff Email Account",
  type: "document",
  fields: [
    defineField({ name: "fullName", title: "Full Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", title: "Email", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "department", title: "Department", type: "string" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Active", value: "active" }, { title: "Inactive", value: "inactive" }] },
      initialValue: "inactive",
    }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 3 }),
    defineField({ name: "createdAt", title: "Created At", type: "datetime" }),
  ],
  preview: {
    select: { title: "fullName", subtitle: "email" },
  },
});
