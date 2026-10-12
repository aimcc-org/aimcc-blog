export interface TaxonomyOption {
  id: number;
  name: string;
}

export interface ArticleTaxonomy {
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
}
