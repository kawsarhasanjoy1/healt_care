import { userRole } from "@prisma/client"
import prisma from "../../shared/prisma.js"
import bcrypt from 'bcrypt'

const seedSuperAdmin = async() => {
    const SUPER_ADMIN_DATA = await prisma.users.findFirst({
        where: {
            role: userRole.SUPER_ADMIN
        }
    })

    if (!SUPER_ADMIN_DATA) {
       const hashedPassword = await bcrypt.hash("superadmin", 12)
    const superAdminData = await prisma.users.create({
            data: {
                name: "kawsar",
                email: "super@admin.com",
                password: hashedPassword,
                role: userRole.SUPER_ADMIN,
                contactNumber: "01234567890",
                admin: {
                    create: {
                        name: "kawsar",
                        contactNumber: "01234567890"
                    }
                }
            }
        });

        return superAdminData
    }

    
}


export default seedSuperAdmin