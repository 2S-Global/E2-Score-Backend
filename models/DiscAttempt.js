const DiscAttemptSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DiscAssessment",
        required: true
    },

    answers: [
        {
            questionId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "DiscQuestion",
                required: true
            },

            selectedOption: {
                type: String,
                required: true
            },

            trait: {
                type: String,
                enum: ["D", "I", "S", "C"],
                required: true
            }
        }
    ],

    scores: {
        D: {
            type: Number,
            default: 0
        },

        I: {
            type: Number,
            default: 0
        },

        S: {
            type: Number,
            default: 0
        },

        C: {
            type: Number,
            default: 0
        }
    },

    result: {
        primaryStyle: {
            type: String,
            enum: ["D", "I", "S", "C"]
        },

        primaryCount: Number,

        secondaryStyle: {
            type: String,
            enum: ["D", "I", "S", "C"]
        },

        secondaryCount: Number,

        band: {
            type: String,
            enum: ["Low", "Moderate", "High"]
        },

        gap: Number,

        intensity: {
            type: String,
            enum: ["Balanced", "Blended", "Pronounced"]
        },

        judgmentSentence: String
    },

    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },

    is_Deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const DiscAttemptModel =
    mongoose.model("DiscAttempt", DiscAttemptSchema);

export default DiscAttemptModel;