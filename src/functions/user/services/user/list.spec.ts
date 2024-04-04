import { faker } from "@faker-js/faker";
import { Location, LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { Professions } from "../../user.types";
import { UserServiceFiltersSpecialties } from "./filters/specialties";
import { UserServiceList } from "./list";
import { UserServiceProfessions } from "./professions";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceList", () => {
  it("Should get all users", async () => {
    const totalCount = 25;
    const limit = 10;
    const cities = [
      faker.location.city(),
      faker.location.city(),
      faker.location.city(),
    ];
    let location: Location;

    for (let customerId = 0; customerId < totalCount; customerId++) {
      location = await createLocation({
        customerId,
        city: faker.helpers.arrayElement(cities),
        locationType: faker.helpers.arrayElement(Object.values(LocationTypes)),
      });

      await createSchedule(
        { customerId },
        {
          days: [faker.helpers.arrayElement(["monday", "friday"])],
          totalProducts: 1,
          locations: [],
        }
      );

      await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
          professions: [
            faker.helpers.arrayElement([
              Professions.HAIR_STYLIST,
              Professions.ESTHETICIAN,
            ]),
          ],
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );
    }

    const firstPage = await UserServiceList({ limit });
    expect(firstPage.results.length).toBe(limit);
    expect(firstPage.totalCount).toBe(totalCount);

    const professions = await UserServiceProfessions();
    for (const profession in professions) {
      const result = await UserServiceList({
        limit: 10,
        filters: { profession },
      });
      expect(result.totalCount).toBe(professions[profession]);

      const specialties = await UserServiceFiltersSpecialties({
        profession,
      });

      for (const specialty in specialties) {
        const result = await UserServiceList({
          limit: 10,
          filters: {
            profession,
            specialties: [specialty],
          },
        });
        expect(result.totalCount).toBe(specialties[specialty]);
      }
    }

    const result = await UserServiceList({
      limit: 10,
      filters: {
        days: ["monday"],
        location: {
          city: location!.city,
          locationType: location!.locationType,
        },
      },
    });

    expect(result.results.length).toBeGreaterThan(0);
  });
});
