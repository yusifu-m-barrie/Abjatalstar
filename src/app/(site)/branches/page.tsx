import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BranchesSection from "@/components/BranchesSection";
import { getBranchesPage, getBranches } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBranchesPage();
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function BranchesPage() {
  const page = await getBranchesPage();
  const branches = await getBranches();

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
