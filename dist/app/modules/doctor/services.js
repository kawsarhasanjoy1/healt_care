import prisma from "../../../shared/prisma.js";
const updateDoctor = async (doctorId, payload) => {
    const { specialties, ...updateData } = payload;
    const userInfo = await prisma.doctor.findUniqueOrThrow({ where: { id: doctorId } });
    await prisma.$transaction(async (transactionClient) => {
        await transactionClient.doctor.update({ where: { id: doctorId }, data: updateData });
        if (specialties && specialties.length > 0) {
            //delete specialties
            const isDeletedTrue = specialties.filter((spacality) => spacality.isDeleted);
            for (const specality of isDeletedTrue) {
                await transactionClient.doctorSpecialties.deleteMany({ where: { doctorId: userInfo.id, specialtiesId: specality.specialtiesId } });
            }
            //create specialties
            const createSpecialties = specialties.filter((specility) => !specility.isDeleted);
            for (const specialty of createSpecialties) {
                await transactionClient.doctorSpecialties.create({ data: {
                        doctorId: userInfo?.id,
                        specialtiesId: specialty.specialtiesId
                    } });
            }
        }
    });
    const result = await prisma.doctor.findUnique({ where: { id: userInfo.id }, include: { doctorSpecialties: { include: { specialties: true } } } });
    return result;
};
export const DoctorServices = {
    updateDoctor
};
