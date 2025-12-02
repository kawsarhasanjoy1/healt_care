import z from "zod";
const adminZodValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email({ message: 'Invalid email' }),
        contactNumber: z.string().optional()
    })
});
export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export const doctorSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    contactNumber: z.string(),
    profilePhoto: z.string().optional(),
    address: z.string().optional(),
    registrationNumber: z.string(),
    experience: z.number().default(0),
    gender: GenderEnum,
    appoinmentFee: z.string(),
    qualification: z.string(),
    currentWorkingPlace: z.string(),
    designation: z.string(),
    isDeleted: z.boolean().default(false),
});
export const userZodValidationSchema = {
    doctorSchema,
    adminZodValidationSchema
};
