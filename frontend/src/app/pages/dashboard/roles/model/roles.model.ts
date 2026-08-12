export interface rolModel {
    id: number;
    name: string;
    is_staff: boolean | null;
    permissions: permissionModel[];
}

export interface permissionModel{
    id: number;
    code: string;
    model: string;
}
