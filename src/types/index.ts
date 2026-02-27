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

export interface DashboardStats {
  totalPilgrims: number;
  hajjRegistrations: number;
  umrahRegistrations: number;
  totalRevenue: number;
  totalReceived: number;
  totalPending: number;
}
