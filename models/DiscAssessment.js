const DiscAssessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DiscQuestion",
            required: true
        }
    ],

    totalQuestions: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["draft", "published", "closed"],
        default: "draft"
    },

    is_Deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const DiscAssessmentModel =
    mongoose.model("DiscAssessment", DiscAssessmentSchema);

export default DiscAssessmentModel;