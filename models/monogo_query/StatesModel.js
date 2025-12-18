import mongoose from "mongoose";

const StateSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      index: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      index: true,
    },

    stateCode: {
      type: String,
      required: true,
    },

    countryId: {
      type: Number, // matches list_tbl_countrie.id
      required: true,
      index: true,
    },

    is_del: {
      type: Number,
      required: true,
      default: 0,
    },

    is_active: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "list_tbl_states",
  }
);

const list_tbl_state = mongoose.model("list_tbl_state", StateSchema);

export default list_tbl_state;
