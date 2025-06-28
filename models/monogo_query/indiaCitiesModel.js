import mongoose from "mongoose";

const indiaCitySchema = new mongoose.Schema(
    {
        id: {
            type: Number
        },
        city_name: {
            type: String,
        },
        popular_location: {
            type: Number
        },
        is_active: {
            type: Number,
            required: true
        },
        is_del: {
            type: Number,
            required: true
        },
        stateId: {
            type: Number
        },
    }
);

const list_india_cities = mongoose.model("list_india_cities", indiaCitySchema, "list_india_cities");

export default list_india_cities;