import { faker } from "@faker-js/faker";
import { Assets } from "./model";

export const generateImages = (count: number, projectIds: any[]): Assets[] => {
  const images = [];
  for (let i = 0; i < count; i++) {
    images.push({
      name: "Image" + " " + (i + 1),
      url: faker.image.imageUrl(),
      customFields: {
        project: projectIds[i],
      },
      parentFolderId: null,
    });
  }
  return images;
};
