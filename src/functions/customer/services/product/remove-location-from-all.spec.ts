import mongoose from "mongoose";

import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerScheduleServiceGet } from "../schedule/get";
import { CustomerProductServiceRemoveLocationFromAll } from "./remove-location-from-all";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceRemoveLocationFromAll", () => {
  const customerId = 123;

  it("should be able to remove one location from all products", async () => {
    const locationRemoveId = new mongoose.Types.ObjectId().toString();

    const newSchedule1 = await createSchedule({
      name: "test",
      customerId,
      products: [
        {
          ...getProductObject({
            locations: [
              {
                location: locationRemoveId,
                locationType: LocationTypes.ORIGIN,
                originType: LocationOriginTypes.COMMERCIAL,
              },
              {
                location: new mongoose.Types.ObjectId(),
                locationType: LocationTypes.ORIGIN,
                originType: LocationOriginTypes.COMMERCIAL,
              },
            ],
          }),
        },
        {
          ...getProductObject({
            locations: [
              {
                location: locationRemoveId,
                locationType: LocationTypes.ORIGIN,
                originType: LocationOriginTypes.COMMERCIAL,
              },
              {
                location: new mongoose.Types.ObjectId(),
                locationType: LocationTypes.ORIGIN,
                originType: LocationOriginTypes.COMMERCIAL,
              },
            ],
          }),
        },
      ],
    });

    const newSchedule2 = await createSchedule({
      name: "test2",
      customerId,
      products: [
        {
          ...getProductObject({
            locations: [
              {
                location: locationRemoveId,
                locationType: LocationTypes.ORIGIN,
                originType: LocationOriginTypes.COMMERCIAL,
              },
            ],
          }),
        },
      ],
    });

    let getSchedule1 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule1.id,
    });

    getSchedule1.products.forEach((product) => {
      const locationIds = product.locations.map((location) =>
        location.location.toString()
      );
      expect(locationIds).toContain(locationRemoveId);
    });

    let getSchedule2 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule2.id,
    });

    getSchedule2.products.forEach((product) => {
      const locationIds = product.locations.map((location) =>
        location.location.toString()
      );
      expect(locationIds).toContain(locationRemoveId);
    });

    expect(getSchedule1.products[0].locations).toHaveLength(2);
    expect(getSchedule1.products[1].locations).toHaveLength(2);
    expect(getSchedule2.products[0].locations).toHaveLength(1);

    await CustomerProductServiceRemoveLocationFromAll({
      locationId: locationRemoveId,
      customerId,
    });

    getSchedule1 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule1.id,
    });

    getSchedule2 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule2.id,
    });

    expect(getSchedule1.products).toHaveLength(2);
    expect(getSchedule2.products).toHaveLength(0);

    getSchedule1.products.forEach((product) => {
      const locationIds = product.locations.map((location) =>
        location.location.toString()
      );
      expect(locationIds).not.toContain(locationRemoveId);
    });
  });
});
