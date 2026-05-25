import { Category, CreateCategoryModelInput } from "./category.model";

export const createCategoryToApi = (category: Category): CreateCategoryModelInput => ({
  name: category.name,
  description: category.description,
});
