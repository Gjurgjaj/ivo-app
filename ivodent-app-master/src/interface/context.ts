import { PaymentItem } from "@components/PaymentCard";

export type UserRole = "admin" | "student" | "teacher";

export interface StudentGrade {
  id?: string;
  course: string;
  student: string;
  subjects: { key: string; grade: string }[];
}

export interface UserItem {
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  uid: string;
  id: string;
  loading?: boolean;
  visible?: boolean;
  payments?: PaymentItem[];
  grades?: StudentGrade;
  fatherName?: string;
  checked?: boolean;
  matriculation?: string;
  password?: string;
  birthDay?: string;
  gender?: boolean;
  isMarried?: boolean;
  birthplace?: string;
  location?: string;
  phone?: string;
  highSchool?: string;
  highSchoolID?: string;
  cardID?: string;
  alName?: string;
  transferAlName?: string;
  prevMatriculation?: string;
  registerDate?: string;
  courses?: string[];
}

export interface Subject {
  value: string;
  key: string;
  grade?: string;
}

export interface Course {
  course: string;
  subjects: Subject[];
  loading?: boolean;
  id?: string;
  checked?: boolean;
  year: number;
  cost?: number;
}
