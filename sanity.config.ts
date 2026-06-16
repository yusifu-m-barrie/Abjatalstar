import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

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
  // Role-based Studio experience:
  // - Main Admin: full access (content + Studio features)
  // - Staff Editor: can edit website content, but cannot delete/archive and cannot touch project/schema settings.
  document: {
    actions: (prev, context) => {
      const roles = context.currentUser?.roles ?? [];
      const isMainAdmin = roles.some(
        (r) => r.name === "mainAdmin" || r.name === "administrator"
      );
      const isStaffEditor =
        !isMainAdmin &&
        roles.some((r) => r.name === "staffEditor" || r.name === "editor");

      if (!isStaffEditor) return prev;

      const websiteDocTypes = new Set([
        "siteSettings",
        "homePage",
        "servicesPage",
        "branchesPage",
        "agentsPage",
        "aboutPage",
        "contactPage",
      ]);

      const schemaTypeName =
        typeof context.schemaType === "string"
          ? context.schemaType
          : // Sanity passes schemaType as an object in some versions
            (context.schemaType as any)?.name;

      // Staff should only manage our website singleton documents.
      if (schemaTypeName && !websiteDocTypes.has(schemaTypeName)) return [];

      // Allow editing + publishing, but block destructive actions.
      const forbiddenActions = new Set([
        "delete",
        "archive",
        "unpublish",
        "discardChanges",
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
