import { faker } from "@faker-js/faker";
import { Assets } from "./model";

export const generateImages = (count: number): Assets[] => {
  const images = [];

  for (let i = 0; i < count; i++) {
    const data = {
      name: faker.commerce.productName() + " Image",
      url: faker.image.imageUrl(),
      customFields: {
        brand: faker.company.name(),
        color: faker.color.human(),
        product: faker.commerce.product(),
      },
      parentFolderId: null,
    };
    images.push(data);
  }
  return images;
};
