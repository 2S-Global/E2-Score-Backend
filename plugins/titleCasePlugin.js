 
 
 
 
 
 //this plugin will convert first character of each word to uppercase in the given fields
 export const titleCasePlugin =  (schema, fields = []) => {
  const toTitleCase = (str) => {
    if (typeof str !== "string") return str;

    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Document middleware
  schema.pre("save", async function () {
    for (const field of fields) {
      if (this.isModified(field) && this[field]) {
        this[field] = toTitleCase(this[field]);
      }
    }
  });

  // Query middleware
  async function formatUpdate() {
    const update = this.getUpdate();

    if (!update) return;

    const data = update.$set ?? update;

    for (const field of fields) {
      if (typeof data[field] === "string") {
        data[field] = toTitleCase(data[field]);
      }
    }
  }

  schema.pre("findOneAndUpdate", formatUpdate);
  schema.pre("updateOne", formatUpdate);
  schema.pre("updateMany", formatUpdate);
}