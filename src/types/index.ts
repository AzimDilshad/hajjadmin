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
  status: "New" | "Contacted" | "Qualified" | "Converted" | "Closed";
  assigned_to?: string;
  follow_up_date?: string;
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
