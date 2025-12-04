import z from "zod";
const createSpecialtySchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }).min(1, 'Title is required'),
    })
});
export const zodSpecialtiesSchema = {
    createSpecialtySchema
};
