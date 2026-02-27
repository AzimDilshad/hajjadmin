import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { Pilgrim, Payment, Package, PassportDetails } from "@/types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
}

export function exportPilgrimProfilePDF(
  pilgrim: Pilgrim,
  passport: PassportDetails | undefined,
  pkg: Package | undefined,
  payments: Payment[]
) {
  const doc = new jsPDF();
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (pkg?.base_price || 0) - totalPaid;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Goodhope Enterprises", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Hajj & Umrah Management System", 14, 27);
  doc.setDrawColor(180, 160, 100);
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Pilgrim Profile Report", 14, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 46);

  // Section 1 - Personal Details
  let y = 54;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. Personal Details", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [120, 110, 60] },
    body: [
      ["Registration No", pilgrim.registration_no, "Full Name", pilgrim.full_name],
      ["Gender", pilgrim.gender, "Date of Birth", pilgrim.date_of_birth],
      ["Mobile", pilgrim.mobile, "Email", pilgrim.email || "—"],
      ["Blood Group", pilgrim.blood_group, "Mahram", pilgrim.mahram_name || "—"],
      ["Address", pilgrim.address, "Status", pilgrim.status],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 2: { fontStyle: "bold", cellWidth: 35 } },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Section 2 - Passport
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("2. Passport Details", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [120, 110, 60] },
    body: passport
      ? [
          ["Passport Number", passport.passport_number, "Place of Issue", passport.place_of_issue],
          ["Issue Date", passport.issue_date, "Expiry Date", passport.expiry_date],
        ]
      : [["No passport details recorded", "", "", ""]],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 2: { fontStyle: "bold", cellWidth: 35 } },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Section 3 - Package
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("3. Package Details", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [120, 110, 60] },
    body: pkg
      ? [
          ["Package", pkg.package_name, "Type", pkg.package_type],
          ["Makkah Hotel", pkg.makkah_hotel, "Madinah Hotel", pkg.madinah_hotel],
          ["Total Days", String(pkg.total_days), "Base Price", formatCurrency(pkg.base_price)],
        ]
      : [["No package assigned", "", "", ""]],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 }, 2: { fontStyle: "bold", cellWidth: 35 } },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Section 4 - Account Summary
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("4. Account Summary", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    headStyles: { fillColor: [120, 110, 60] },
    body: [
      ["Package Price", formatCurrency(pkg?.base_price || 0)],
      ["Total Paid", formatCurrency(totalPaid)],
      ["Balance Due", formatCurrency(balance)],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Section 5 - Payment History
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("5. Payment History", 14, y);
  y += 2;
  autoTable(doc, {
    startY: y,
    theme: "striped",
    headStyles: { fillColor: [120, 110, 60] },
    head: [["Date", "Amount", "Mode", "Reference", "Notes"]],
    body: payments.length > 0
      ? payments.map((p) => [p.payment_date, formatCurrency(p.amount), p.payment_mode, p.reference_no, p.notes || "—"])
      : [["No payments recorded", "", "", "", ""]],
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Goodhope Enterprises — Confidential | Page ${i} of ${pageCount}`, 14, 287);
  }

  doc.save(`${pilgrim.registration_no}_Profile.pdf`);
}

export function exportPaymentStatementPDF(
  pilgrim: Pilgrim,
  pkg: Package | undefined,
  payments: Payment[]
) {
  const doc = new jsPDF();
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (pkg?.base_price || 0) - totalPaid;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Statement", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Goodhope Enterprises — Hajj & Umrah Management", 14, 27);
  doc.line(14, 30, 196, 30);

  doc.setFontSize(10);
  doc.text(`Pilgrim: ${pilgrim.full_name}`, 14, 38);
  doc.text(`Reg. No: ${pilgrim.registration_no}`, 14, 44);
  doc.text(`Package: ${pkg?.package_name || "—"} (${pkg?.package_type || "—"})`, 14, 50);
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 140, 38);

  autoTable(doc, {
    startY: 58,
    theme: "striped",
    headStyles: { fillColor: [120, 110, 60] },
    head: [["#", "Date", "Amount", "Mode", "Reference", "Notes"]],
    body: payments.map((p, i) => [
      i + 1,
      p.payment_date,
      formatCurrency(p.amount),
      p.payment_mode,
      p.reference_no,
      p.notes || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Package Price: ${formatCurrency(pkg?.base_price || 0)}`, 14, finalY);
  doc.text(`Total Paid: ${formatCurrency(totalPaid)}`, 14, finalY + 7);
  doc.setTextColor(balance > 0 ? 200 : 0, balance > 0 ? 80 : 150, balance > 0 ? 0 : 0);
  doc.text(`Balance Due: ${formatCurrency(balance)}`, 14, finalY + 14);

  doc.save(`${pilgrim.registration_no}_Payment_Statement.pdf`);
}

export function exportPilgrimExcel(
  pilgrim: Pilgrim,
  passport: PassportDetails | undefined,
  pkg: Package | undefined,
  payments: Payment[]
) {
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const wb = XLSX.utils.book_new();

  // Personal Details sheet
  const personalData = [
    ["Registration No", pilgrim.registration_no],
    ["Full Name", pilgrim.full_name],
    ["Passport Name", pilgrim.passport_name],
    ["Gender", pilgrim.gender],
    ["Date of Birth", pilgrim.date_of_birth],
    ["Mobile", pilgrim.mobile],
    ["Email", pilgrim.email],
    ["Address", pilgrim.address],
    ["Blood Group", pilgrim.blood_group],
    ["Mahram", pilgrim.mahram_name || "—"],
    ["Departure City", pilgrim.departure_city],
    ["Room Type", pilgrim.room_type],
    ["Status", pilgrim.status],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet([["Field", "Value"], ...personalData]);
  ws1["!cols"] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Personal Details");

  // Passport sheet
  if (passport) {
    const ws2 = XLSX.utils.aoa_to_sheet([
      ["Field", "Value"],
      ["Passport Number", passport.passport_number],
      ["Issue Date", passport.issue_date],
      ["Expiry Date", passport.expiry_date],
      ["Place of Issue", passport.place_of_issue],
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, "Passport");
  }

  // Package sheet
  if (pkg) {
    const ws3 = XLSX.utils.aoa_to_sheet([
      ["Field", "Value"],
      ["Package Name", pkg.package_name],
      ["Package Type", pkg.package_type],
      ["Makkah Hotel", pkg.makkah_hotel],
      ["Madinah Hotel", pkg.madinah_hotel],
      ["Total Days", pkg.total_days],
      ["Base Price", pkg.base_price],
    ]);
    XLSX.utils.book_append_sheet(wb, ws3, "Package");
  }

  // Payments sheet
  const paymentRows = payments.map((p) => [p.payment_date, p.amount, p.payment_mode, p.reference_no, p.notes || ""]);
  const ws4 = XLSX.utils.aoa_to_sheet([
    ["Date", "Amount", "Mode", "Reference", "Notes"],
    ...paymentRows,
    [],
    ["Total Paid", totalPaid],
    ["Package Price", pkg?.base_price || 0],
    ["Balance", (pkg?.base_price || 0) - totalPaid],
  ]);
  ws4["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Payments");

  XLSX.writeFile(wb, `${pilgrim.registration_no}_Data.xlsx`);
}

export function exportAllPilgrimsExcel(pilgrims: Pilgrim[], packages: Package[], payments: Payment[]) {
  const wb = XLSX.utils.book_new();
  const rows = pilgrims.map((p) => {
    const pkg = packages.find((pk) => pk.id === p.package_id);
    const paid = payments.filter((pay) => pay.pilgrim_id === p.id).reduce((s, pay) => s + pay.amount, 0);
    return [
      p.registration_no, p.full_name, p.passport_name, p.gender, p.date_of_birth,
      p.mobile, p.email, p.address, p.blood_group, p.mahram_name || "",
      pkg?.package_name || "", pkg?.package_type || "", p.departure_city, p.room_type,
      p.status, pkg?.base_price || 0, paid, (pkg?.base_price || 0) - paid,
    ];
  });
  const ws = XLSX.utils.aoa_to_sheet([
    ["Reg No", "Name", "Passport Name", "Gender", "DOB", "Mobile", "Email", "Address",
     "Blood Group", "Mahram", "Package", "Type", "City", "Room", "Status", "Price", "Paid", "Balance"],
    ...rows,
  ]);
  ws["!cols"] = Array(18).fill({ wch: 16 });
  XLSX.utils.book_append_sheet(wb, ws, "All Pilgrims");
  XLSX.writeFile(wb, `All_Pilgrims_${new Date().toISOString().split("T")[0]}.xlsx`);
}
