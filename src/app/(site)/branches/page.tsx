import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BranchesSection from "@/components/BranchesSection";
import { getBranchesPage, getBranches } from "@/lib/content";

export function generateMetadata(): Metadata {
  const page = getBranchesPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default function BranchesPage() {
  const page = getBranchesPage();
  const branches = getBranches();

  return (
    <>
      <PageHeader
        badge={page.header.badge}
        title={page.header.title}
        subtitle={page.header.subtitle}
      />
      <BranchesSection
        section={page.section}
        branches={branches}
        showViewAll={false}
      />
    </>
  );
}
