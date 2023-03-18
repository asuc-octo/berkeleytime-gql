import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

export const CustomEventSchema = new Schema({
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  title: { type: String, required: false },
  location: { type: String, required: false },
  description: { type: String, required: false },
  days_of_week: { type: String, required: false }
});


export const ScheduleSchema = new Schema({
  _id: { type: Types.ObjectId, reqired: true },
  name: { type: String, required: false },
  created_by: { type: String, required: true },
  term: { type: String, required: true },
  public: { type: Boolean, required: true },
  class_IDs: { type: [String], required: false },
  primary_section_IDs: { type: [String], required: false },
  secondary_section_IDs: { type: [String], required: false },
  custom_events: { type: [CustomEventSchema], required: false }
}, { timestamps: true });

export const CustomEventModel = mongoose.model("customEvent", CustomEventSchema, "customEvent");
export type CustomEventType = InferSchemaType<typeof CustomEventSchema>;
export const ScheduleModel = mongoose.model("schedule", ScheduleSchema, "schedule");
export type ScheduleType = InferSchemaType<typeof ScheduleSchema>;
