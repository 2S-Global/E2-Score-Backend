import slugify from "slugify";

export const slugPlugin = (schema, fields = []) => {
  const createSlug = (value) => {
    if (typeof value !== "string") return value;

    return slugify(value.trim(), {
      lower: true,
      strict: true,
      trim: true,
    });
  };

  // Document middleware
  schema.pre("save", function () {
    for (const field of fields) {
      if (this.isModified(field) && this[field]) {
        this.slug = createSlug(this[field]);
      }
    }
  });

  // Query middleware
  function updateSlug() {
    const update = this.getUpdate();

    if (!update) return;

    const data = update.$set ?? update;

    for (const field of fields) {
      if (typeof data[field] === "string") {
        data.slug = createSlug(data[field]);
      }
    }
  }

  schema.pre("findOneAndUpdate", updateSlug);
  schema.pre("updateOne", updateSlug);
  schema.pre("updateMany", updateSlug);
};