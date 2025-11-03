import mongoose from "mongoose";

const indiaCitySchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  city_name: {
    type: String,
  },
  popular_location: {
    type: Number,
  },
  is_active: {
    type: Number,
    required: true,
  },
  is_del: {
    type: Number,
    required: true,
  },
  stateId: {
    type: Number,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  // ✅ GeoJSON location for geospatial queries (optional)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
  },
});

indiaCitySchema.index({ location: "2dsphere" });

indiaCitySchema.pre("save", function (next) {
  if (this.latitude && this.longitude) {
    const lat = parseFloat(this.latitude);
    const lon = parseFloat(this.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      this.location = { type: "Point", coordinates: [lon, lat] };
    }
  }
  next();
});

indiaCitySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.latitude && update.longitude) {
    const lat = parseFloat(update.latitude);
    const lon = parseFloat(update.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      update.location = { type: "Point", coordinates: [lon, lat] };
    }
  }

  next();
});

const list_india_cities = mongoose.model(
  "list_india_cities",
  indiaCitySchema,
  "list_india_cities"
);

export default list_india_cities;
