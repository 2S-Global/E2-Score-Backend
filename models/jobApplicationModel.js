import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobPostingList",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // user additional information started
        noticePeriod: {
            type: String,
            required: true,
        },
        preferredTime: {
            type: String,
            required: true,
        },
        availabilityOnSaturday: {
            type: String,
            required: true,
        },
        willingToRelocate: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        experienceLevel: {
            type: String,
        },
        acceptedTerms: {
            type: Boolean,
            required: true,
        },
        // user additional information ended

        // interview details started
        interviewDate: {
            type: Date, // e.g. 2026-02-05
        },
        interviewTime: {
            type: String, // e.g. "10:30 AM"
        },
        designation: {
            type: String, // e.g. "Web Developer"
        },
        // interview details ended

        // offer letter details started
        offer_letter_designation: {
            type: String, // e.g. "Software Engineer"
        },
        offer_letter_joining_date: {
            type: Date, // e.g. 2026-03-01
        },
        offer_letter_salary: {
            type: String, // e.g. 600000
        },
        offer_letter_message: {
            type: String, // custom offer message
        },
        // offer letter details ended

        isInterviewFeedbackSubmitted: {
            type: Boolean,
            default: false,
        },
        interviewInvitationAccepted: {
            type: Boolean,
            // default: false,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            // enum: ["applied", "shortlisted", "rejected"],
            default: "applied",
        },

        requestDate: {
            type: Date, // e.g. 2026-02-05
        },
        requestStartTime: {
            type: String, // e.g. "10:30 AM"
        },
        requestEndTime: {
            type: String, // e.g. "10:30 AM"
        },
        requestReschedule: {
            type: Boolean,
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

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);


export default JobApplication;
