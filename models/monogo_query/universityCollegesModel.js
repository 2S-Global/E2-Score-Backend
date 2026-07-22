import mongoose from "mongoose";
import slugify from 'slugify'
const universityCollegeSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  university_id: {
    type: Number,
  },
  clg_code: {
    type: String,
  },
  name: {
    type: String,
  },
  slug: {
    type: String,
  },
  establish_on: {
    type: String,
  },
  address: {
    type: String,
  },
  tel: {
    type: String,
  },
  fax: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  courses: {
    type: String,
  },
  is_del: {
    type: Number,
    required: true,
  },
  is_active: {
    type: Number,
    required: true,
  },
  flag: {
    type: Number,
    required: true,
  },
});


universityCollegeSchema.index({
  slug: 1,
  name: 1,
  isActive: 1,
  is_del: 1
})




universityCollegeSchema.pre('save', function () {
  if (!this.isModified("name")) {
    return;
  }

  this.slug = slugify(this.name.trim(), {
    lower: true,
    strict: true,
    trim: true,
  })
})

const list_university_colleges = mongoose.model(
  "list_university_colleges",
  universityCollegeSchema,
  "list_university_colleges",
);

export default list_university_colleges;
