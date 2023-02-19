import { faker } from "@faker-js/faker";
import { IProject } from "./model";

export const generateProjects = (count = 10): IProject[] => {
  const projects = [];
  for (let i = 0; i < count; i++) {
    projects.push({
      name: faker.commerce.productName() + " " + "Project",
    });
  }
  return projects;
};
