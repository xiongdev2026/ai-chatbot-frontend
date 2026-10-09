export interface MedicalService {
    id: string;
    name: string;
    description: string;
    departmentId: string;
    departmentName?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}