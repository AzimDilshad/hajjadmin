export interface Pilgrim {
  id: string;
  registration_no: string;
  full_name: string;
  passport_name: string;
  gender: "Male" | "Female";
  date_of_birth: string;
  mobile: string;
  email: string;
  address: string;
  blood_group: string;
  mahram_name?: string;
  package_id: string;
  departure_city: string;
  room_type: "Double" | "Triple" | "Quad";
  status: "Inquiry" | "Registered" | "Visa Process" | "Completed";
  created_at: string;
  updated_at: string;
  photo_data_url?: string;
}

export interface PassportDetails {
  id: string;
  pilgrim_id: string;
  passport_number: string;
  issue_date: string;
  expiry_date: string;
  place_of_issue: string;
}

export interface Package {
  id: string;
  package_name: string;
  package_type: "Economy" | "Deluxe" | "VIP";
  makkah_hotel: string;
  madinah_hotel: string;
  total_days: number;
  base_price: number;
  tags?: string[];
}

export interface Payment {
  id: string;
  pilgrim_id: string;
  amount: number;
  payment_date: string;
  payment_mode: "Cash" | "UPI" | "Bank Transfer";
  reference_no: string;
  notes?: string;
}

export interface Expense {
  id: string;
  batch_id: string;
  title: string;
  amount: number;
  expense_date: string;
  category: string;
  notes?: string;
}

export type DocumentType = "Passport Copy" | "Aadhar Copy" | "Medical Certificate" | "Visa Copy" | "Ticket" | "Photo" | "Other";

export interface DocumentRecord {
  id: string;
  pilgrim_id: string;
  name: string;
  size: string;
  mime_type: string;
  uploaded_at: string;
  doc_type: DocumentType;
  data_url?: string;
}

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Follow-up Required"
  | "Interested"
  | "Negotiation"
  | "Confirmed"
  | "Converted to Pilgrim"
  | "Not Interested"
  | "Closed";

export interface Lead {
  id: string;
  full_name: string;
  mobile: string;
  email?: string;
  city?: string;
  source: "Walk-in" | "Website" | "Referral" | "Social Media" | "Call" | "Other";
  interest: "Hajj" | "Umrah" | "Both" | "Not Sure";
  budget?: string;
  notes?: string;
  status: LeadStatus;
  assigned_to?: string;
  follow_up_date?: string;
  package_id?: string;
  converted_pilgrim_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadConversionHistory {
  id: string;
  lead_id: string;
  pilgrim_id: string;
  package_id: string;
  converted_at: string;
}

export interface VaccineTemplate {
  id: string;
  name: string;
  mandatory?: boolean;
  enabled: boolean;
}

export interface MedicalReport {
  id: string;
  pilgrim_id: string;
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  chronic_illness?: boolean;
  disability_status?: boolean;
  special_needs?: string;
  conditions?: string[];
  medications?: string;
  insulin_dependent?: boolean;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  wheelchair_required?: boolean;
  oxygen_support_required?: boolean;
  insurance_provider?: string;
  insurance_valid_till?: string;
  medical_fitness_status?: "Fit" | "Not Fit" | "Conditional Fit";
  medical_clearance_status?: "Cleared" | "Pending Documents" | "Not Fit";
  vaccinations?: Array<{ vaccine: string; date?: string; expiry_date?: string; certificate_url?: string }>;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalPilgrims: number;
  hajjRegistrations: number;
  umrahRegistrations: number;
  totalRevenue: number;
  totalReceived: number;
  totalPending: number;
}
