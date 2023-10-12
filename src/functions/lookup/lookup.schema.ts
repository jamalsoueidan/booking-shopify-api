import mongoose, { Document, Model } from "mongoose";
import { Lookup } from "./lookup.type";

export interface ILookup extends Omit<Lookup, "_id"> {
  expireAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILookupDocument extends ILookup, Document {}

export const LookupMongooseSchema = new mongoose.Schema<
  ILookupDocument,
  Model<ILookupDocument>
>(
  {
    origin: {
      customerId: {
        type: Number,
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
      distanceForFree: {
        type: Number,
        default: 0,
      },
      distanceHourlyRate: {
        type: Number,
        default: 0,
      },
      fixedRatePerKm: {
        type: Number,
        default: 0,
      },
    },
    destination: {
      name: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
    },
    duration: {
      text: String,
      value: Number,
    },
    distance: {
      text: String,
      value: Number,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expireAfterSeconds: 3600 },
    },
  },
  { timestamps: true }
);
