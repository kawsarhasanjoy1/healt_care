import { z } from 'zod';
export const createDoctorSpecialtySchema = z.object({
    body: z.object({
        doctorId: z.string().min(1, 'doctorId is required'),
        specialtiesId: z.string().min(1, 'specialtiesId is required'),
    }),
});
export const doctorSpecialtiesZodSchema = {
    createDoctorSpecialtySchema
};
