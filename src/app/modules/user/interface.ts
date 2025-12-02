export type TFilter = {
    email: string,
    contactNumber: string,
    searchTerm: string,
    name: string
}


export type TAdminPayload = {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto: string;
    contactNumber: string;
    needPasswordCng?: boolean;
    status: 'ACTIVE' | 'BLOCKED';
  };
};


export interface TDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
    contactNumber: string;
    profilePhoto?: string; 
    address?: string | null;
    registrationNumber: string;
    experience?: number; 
    gender: "MALE" | "FEMALE";
    appoinmentFee: string;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    isDeleted?: boolean; 
  };
}
