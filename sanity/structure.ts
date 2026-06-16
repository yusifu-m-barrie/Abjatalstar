import type { ComponentType } from "react";
import type { StructureResolver } from "sanity/structure";
import {
  CogIcon,
  HomeIcon,
  DocumentsIcon,
  PinIcon,
  UsersIcon,
  InfoOutlineIcon,
  EnvelopeIcon,
} from "@sanity/icons";

const singleton = (
  S: Parameters<StructureResolver>[0],
  type: string,
  title: string,
  icon?: ComponentType
) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website Content")
    .items([
      singleton(S, "siteSettings", "Site Settings", CogIcon),
      S.divider(),
      singleton(S, "homePage", "Homepage", HomeIcon),
      singleton(S, "servicesPage", "Services", DocumentsIcon),
      singleton(S, "branchesPage", "Branches", PinIcon),
      singleton(S, "agentsPage", "Agents", UsersIcon),
      singleton(S, "aboutPage", "About", InfoOutlineIcon),
      singleton(S, "contactPage", "Contact", EnvelopeIcon),
    ]);
