export interface Doctor {
    id: string;
    fullName: string;
    specialty: string;
    departmentId: string;
    departmentName?: string;
    medicalServiceId: string;
    medicalServiceName?: string;
    bio?: string;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}