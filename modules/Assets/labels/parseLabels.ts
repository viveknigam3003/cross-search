// From the amazon rekgonition service
// Get -> Products list from "Categories.Apparel and Accessories"
// Get -> Synonyms of each label with Aliases.
// Get -> Reverse order of parent names for each label (for relevance)
// It's like = Categories -> Parents -> Labels
import {
  DetectLabelsResponse,
  DominantColors,
  Labels,
} from "aws-sdk/clients/rekognition";

// Only where category is "Apparel and Accessories"

const PRODUCT_KEYS = ["Apparel and Accessories"];

const getColorsArray = (colors: DominantColors) => {
  const c = colors.map((color) => color.SimplifiedColor);
  const uniqueColors = [...new Set(c)].join(", ");
    return uniqueColors;
};

const simplifyLabels = (labels: Labels) => {
  return labels.map((label) => {
    const parents = label.Parents?.map((parent) => parent.Name).reverse() || [];

    const synonyms = label.Aliases?.map((alias) => alias.Name) || [];

    const keys = [label.Name, ...parents, ...synonyms].join(", ");

    const category =
      label.Categories?.map((category) => category.Name)[0] || "";

    return {
      keys,
      category,
    };
  });
};

const getProducts = (labelList: Array<{ keys: string; category: string }>) => {
  const list = labelList
    .filter((label) => PRODUCT_KEYS.includes(label.category))
    .map((label) => label.keys).join(", ").split(", ");

    const uniqueList = [...new Set(list)].join(", ");
    return uniqueList;
};

const getOtherTags = (
  labelList: Array<{ keys: string; category: string }>
) => {
  const list = labelList
    .filter((label) => !PRODUCT_KEYS.includes(label.category))
    .map((label) => label.keys).join(", ").split(", ");

    const uniqueList = [...new Set(list)].join(", ");
    return uniqueList;
};

export const parseLabelsData = (res: DetectLabelsResponse) => {
  const colors = getColorsArray(res?.ImageProperties?.Foreground?.DominantColors || []);
  
  const labels = simplifyLabels(res.Labels || []);
  const products = getProducts(labels);
  const tags = getOtherTags(labels);

  return {
    colors,
    products,
    tags,
  };
};
