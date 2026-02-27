import { Pilgrim, PassportDetails, Package, Payment, DashboardStats } from "@/types";

export const PACKAGES: Package[] = [
  { id: "pkg1", package_name: "Hajj 2026", package_type: "Economy", makkah_hotel: "Al Safwah Hotel", madinah_hotel: "Dar Al Taqwa", total_days: 21, base_price: 350000 },
  { id: "pkg2", package_name: "Hajj 2026", package_type: "Deluxe", makkah_hotel: "Hilton Suites", madinah_hotel: "Oberoi Madinah", total_days: 25, base_price: 550000 },
  { id: "pkg3", package_name: "Hajj 2026", package_type: "VIP", makkah_hotel: "Raffles Makkah", madinah_hotel: "The Ritz Madinah", total_days: 30, base_price: 850000 },
  { id: "pkg4", package_name: "Umrah Ramadan 2026", package_type: "Economy", makkah_hotel: "Al Marwa Hotel", madinah_hotel: "Madinah Hilton", total_days: 14, base_price: 120000 },
  { id: "pkg5", package_name: "Umrah Ramadan 2026", package_type: "Deluxe", makkah_hotel: "Swissotel Makkah", madinah_hotel: "Pullman Madinah", total_days: 14, base_price: 200000 },
];

export const PILGRIMS: Pilgrim[] = [
  { id: "p1", registration_no: "GH-2026-001", full_name: "Mohammed Rizwan Ahmed", passport_name: "MOHAMMED RIZWAN AHMED", gender: "Male", date_of_birth: "1985-03-15", mobile: "+91 98765 43210", email: "rizwan@email.com", address: "12, Sultan Road, Hyderabad", blood_group: "B+", package_id: "pkg1", departure_city: "Hyderabad", room_type: "Triple", status: "Registered", created_at: "2025-12-01", updated_at: "2026-01-15" },
  { id: "p2", registration_no: "GH-2026-002", full_name: "Fatima Begum", passport_name: "FATIMA BEGUM", gender: "Female", date_of_birth: "1990-07-22", mobile: "+91 87654 32109", email: "fatima@email.com", address: "45, MG Road, Bangalore", blood_group: "A+", mahram_name: "Mohammed Rizwan Ahmed", package_id: "pkg2", departure_city: "Bangalore", room_type: "Double", status: "Visa Process", created_at: "2025-12-05", updated_at: "2026-01-20" },
  { id: "p3", registration_no: "GH-2026-003", full_name: "Abdul Kareem Sheikh", passport_name: "ABDUL KAREEM SHEIKH", gender: "Male", date_of_birth: "1978-11-10", mobile: "+91 76543 21098", email: "kareem@email.com", address: "78, Jubilee Hills, Hyderabad", blood_group: "O+", package_id: "pkg3", departure_city: "Hyderabad", room_type: "Double", status: "Completed", created_at: "2025-11-15", updated_at: "2026-02-10" },
  { id: "p4", registration_no: "GH-2026-004", full_name: "Ayesha Khan", passport_name: "AYESHA KHAN", gender: "Female", date_of_birth: "1995-01-25", mobile: "+91 65432 10987", email: "ayesha@email.com", address: "23, Banjara Hills, Hyderabad", blood_group: "AB+", mahram_name: "Abdul Kareem Sheikh", package_id: "pkg4", departure_city: "Mumbai", room_type: "Quad", status: "Inquiry", created_at: "2026-01-10", updated_at: "2026-02-01" },
  { id: "p5", registration_no: "GH-2026-005", full_name: "Ibrahim Patel", passport_name: "IBRAHIM PATEL", gender: "Male", date_of_birth: "1982-06-08", mobile: "+91 54321 09876", email: "ibrahim@email.com", address: "56, Deccan Road, Pune", blood_group: "B-", package_id: "pkg5", departure_city: "Pune", room_type: "Triple", status: "Registered", created_at: "2026-01-20", updated_at: "2026-02-15" },
  { id: "p6", registration_no: "GH-2026-006", full_name: "Sana Parveen", passport_name: "SANA PARVEEN", gender: "Female", date_of_birth: "1988-09-14", mobile: "+91 43210 98765", email: "sana@email.com", address: "89, Tank Bund, Hyderabad", blood_group: "A-", mahram_name: "Ibrahim Patel", package_id: "pkg1", departure_city: "Hyderabad", room_type: "Double", status: "Registered", created_at: "2026-02-01", updated_at: "2026-02-20" },
];

export const PASSPORT_DETAILS: PassportDetails[] = [
  { id: "pp1", pilgrim_id: "p1", passport_number: "T1234567", issue_date: "2022-05-10", expiry_date: "2032-05-09", place_of_issue: "Hyderabad" },
  { id: "pp2", pilgrim_id: "p2", passport_number: "U2345678", issue_date: "2021-08-15", expiry_date: "2031-08-14", place_of_issue: "Bangalore" },
  { id: "pp3", pilgrim_id: "p3", passport_number: "V3456789", issue_date: "2020-03-20", expiry_date: "2030-03-19", place_of_issue: "Hyderabad" },
  { id: "pp4", pilgrim_id: "p4", passport_number: "W4567890", issue_date: "2023-01-05", expiry_date: "2033-01-04", place_of_issue: "Mumbai" },
  { id: "pp5", pilgrim_id: "p5", passport_number: "X5678901", issue_date: "2022-11-25", expiry_date: "2032-11-24", place_of_issue: "Pune" },
];

export const PAYMENTS: Payment[] = [
  { id: "pay1", pilgrim_id: "p1", amount: 100000, payment_date: "2025-12-05", payment_mode: "Bank Transfer", reference_no: "BT-001", notes: "Initial deposit" },
  { id: "pay2", pilgrim_id: "p1", amount: 100000, payment_date: "2026-01-10", payment_mode: "UPI", reference_no: "UPI-002" },
  { id: "pay3", pilgrim_id: "p2", amount: 200000, payment_date: "2025-12-10", payment_mode: "Bank Transfer", reference_no: "BT-003", notes: "Full advance" },
  { id: "pay4", pilgrim_id: "p2", amount: 150000, payment_date: "2026-01-15", payment_mode: "Cash", reference_no: "CASH-004" },
  { id: "pay5", pilgrim_id: "p3", amount: 850000, payment_date: "2025-11-20", payment_mode: "Bank Transfer", reference_no: "BT-005", notes: "Full payment" },
  { id: "pay6", pilgrim_id: "p4", amount: 30000, payment_date: "2026-01-15", payment_mode: "UPI", reference_no: "UPI-006", notes: "Inquiry deposit" },
  { id: "pay7", pilgrim_id: "p5", amount: 80000, payment_date: "2026-01-25", payment_mode: "Cash", reference_no: "CASH-007" },
  { id: "pay8", pilgrim_id: "p6", amount: 150000, payment_date: "2026-02-05", payment_mode: "Bank Transfer", reference_no: "BT-008" },
];

export function getDashboardStats(): DashboardStats {
  const hajjPkgIds = PACKAGES.filter(p => p.package_name.toLowerCase().includes("hajj")).map(p => p.id);
  const umrahPkgIds = PACKAGES.filter(p => p.package_name.toLowerCase().includes("umrah")).map(p => p.id);

  const totalRevenue = PILGRIMS.reduce((sum, p) => {
    const pkg = PACKAGES.find(pk => pk.id === p.package_id);
    return sum + (pkg?.base_price || 0);
  }, 0);

  const totalReceived = PAYMENTS.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalPilgrims: PILGRIMS.length,
    hajjRegistrations: PILGRIMS.filter(p => hajjPkgIds.includes(p.package_id)).length,
    umrahRegistrations: PILGRIMS.filter(p => umrahPkgIds.includes(p.package_id)).length,
    totalRevenue,
    totalReceived,
    totalPending: totalRevenue - totalReceived,
  };
}

export function getPilgrimPayments(pilgrimId: string): Payment[] {
  return PAYMENTS.filter(p => p.pilgrim_id === pilgrimId);
}

export function getPilgrimPackage(packageId: string): Package | undefined {
  return PACKAGES.find(p => p.id === packageId);
}

export function getPilgrimPassport(pilgrimId: string): PassportDetails | undefined {
  return PASSPORT_DETAILS.find(p => p.pilgrim_id === pilgrimId);
}
