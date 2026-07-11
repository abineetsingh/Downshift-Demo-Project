import { DiscoveryPage } from "@/components/discovery-page";
import { loadCatalog } from "@/lib/catalog";
import { parseState } from "@/lib/url-state";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const catalog = loadCatalog();

  return <DiscoveryPage catalog={catalog} initialState={parseState(params)} />;
}
