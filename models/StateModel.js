import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,

    },
    isDel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const State = mongoose.model('State', stateSchema);

export default State;
