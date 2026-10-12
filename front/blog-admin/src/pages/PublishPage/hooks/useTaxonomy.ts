import { useEffect, useState } from "react";
import { articleService } from "@/services/articles";
import type { ArticleTaxonomy } from "@/utils/publishing";
export function useTaxonomy() {
  const [taxonomy, setTaxonomy] = useState<ArticleTaxonomy>({
    categories: [],
    tags: [],
  });
  const [taxonomyStatus, setTaxonomyStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [taxonomyAttempt, setTaxonomyAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    setTaxonomyStatus("loading");
    void articleService
      .taxonomy(controller.signal)
      .then((taxonomy) => {
        if (active) {
          setTaxonomy(taxonomy);
          setTaxonomyStatus("ready");
        }
      })
      .catch(() => {
        if (active) setTaxonomyStatus("error");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [taxonomyAttempt]);

  return { taxonomy, taxonomyStatus, setTaxonomyAttempt };
}
