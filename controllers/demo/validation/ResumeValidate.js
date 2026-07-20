import z from 'zod'


export const ResumeSchema = z.object({
    name: z.string().min(1, "Must be more than 1 alphabet"),
    title: z.string().min(1, "Must be more than 1 alphabet"),
    experience: z.string().min(1, "Must be more than 1 alphabet"),
    location: z.string().min(1, "Must be more than 1 alphabet"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Must be more than 1 alphabet"),
    skills: z.array(z.string()).min(1, "Must have at least one skill"),
    education: z.string().min(1, "Must be more than 1 alphabet"),
    currentCompany: z.string().min(1, "Must be more than 1 alphabet"),
})

