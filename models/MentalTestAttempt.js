
import mongoose from "mongoose";

const MentalTestAttemptSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "MentalTestQuiz",
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

        scoresPercentage: {
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

            primaryStyleName: {
                type: String
            },

            primaryCount: {
                type: Number
            },

            secondaryStyle: {
                type: String,
                enum: ["D", "I", "S", "C"]
            },

            secondaryStyleName: {
                type: String
            },

            secondaryCount: {
                type: Number
            },

            band: {
                type: String,
                enum: ["Low", "Moderate", "High"]
            },

            gap: {
                type: Number
            },

            intensity: {
                type: String,
                enum: ["Balanced", "Blended", "Pronounced"]
            },

            descriptor: {
                type: String
            }
        },

        totalQuestions: {
            type: Number,
            default: 0
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
    },
    {
        timestamps: true
    }
);

const MentalTestAttemptModel = mongoose.model(
    "MentalTestAttempt",
    MentalTestAttemptSchema
);

export default MentalTestAttemptModel;

