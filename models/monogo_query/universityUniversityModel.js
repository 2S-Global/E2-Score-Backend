import mongoose from "mongoose";

const universityUniversitySchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  name: {
    type: String,
  },
  slug: {
    type: String,
  },
  address: {
    type: String,
  },
  establishment_year: {
    type: String,
  },
  cat_id: {
    type: String,
  },
  state_id: {
    type: String,
  },
  flag: {
    type: Number,
  },
  is_del: {
    type: Number,
    required: true,
  },
  is_active: {
    type: Number,
    required: true,
  },
});

universityUniversitySchema.index({
  slug: 1,
  name: 1,
});

universityUniversitySchema.pre("save", function () {
  if (!this.isModified("name")) {
    return;
  }

  this.slug = slugify(this.name.trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
});

const list_university_univercities = mongoose.model(
  "list_university_univercities",
  universityUniversitySchema,
  "list_university_univercities",
);

export default list_university_univercities;
