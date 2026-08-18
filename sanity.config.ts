import { UsersIcon } from "@sanity/icons";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import InviteEditorTool from "./src/components/sanity/InviteEditorTool";
import { apiVersion, dataset, projectId } from "./sanity/env";
import {
  isSanityAdmin,
  isStaffEditor,
  WEBSITE_DOC_TYPE_SET,
} from "./sanity/roles";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const HIDDEN_CREATE_TYPES = new Set([
  "staffEmailAccount",
  "staffEmailActivityLog",
]);

export default defineConfig({
  name: "abjatal-star",
  title: "Abjatal Star CMS",
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  basePath: "/admin",
  plugins: [
    structureTool({ structure }),
  ],
  tools: (prev, { currentUser }) => {
    if (!isSanityAdmin(currentUser)) return prev;
    return [
      ...prev,
      {
        name: "invite-editor",
        title: "Invite Editor",
        icon: UsersIcon,
        component: InviteEditorTool,
      },
    ];
  },
  // Role-based Studio experience:
  // - Administrator: full access + Invite Editor tool
  // - Editor: website content only (no delete, no member management)
  document: {
    newDocumentOptions: (prev, { currentUser }) => {
      if (isStaffEditor(currentUser)) return [];
      return prev.filter((template) => !HIDDEN_CREATE_TYPES.has(template.templateId));
    },
    actions: (prev, context) => {
      if (!isStaffEditor(context.currentUser)) return prev;

      const schemaTypeName =
        typeof context.schemaType === "string"
          ? context.schemaType
          : (context.schemaType as { name?: string } | undefined)?.name;

      if (schemaTypeName && !WEBSITE_DOC_TYPE_SET.has(schemaTypeName)) {
        return [];
      }

      const forbiddenActions = new Set([
        "delete",
        "archive",
        "unpublish",
        "duplicate",
      ]);

      return prev.filter((action) => {
        const actionName = action.action;
        if (!actionName) return true;
        return !forbiddenActions.has(actionName);
      });
    },
  },
  schema: { types: schemaTypes },
});
