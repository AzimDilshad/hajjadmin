#!/usr/bin/env python3
from pathlib import Path
import textwrap

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "docs" / "api-documentation.md"
out = ROOT / "docs" / "api-documentation.pdf"

raw_lines = src.read_text(encoding="utf-8").splitlines()
wrapped = []
for line in raw_lines:
    if not line.strip():
        wrapped.append("")
        continue
    indent = ""
    body = line
    if line.startswith("- "):
        indent = "  "
    if line.startswith("  - "):
        indent = "    "
    if line.startswith("### "):
        body = line[4:]
    elif line.startswith("## "):
        body = line[3:]
    elif line.startswith("# "):
        body = line[2:]
    chunks = textwrap.wrap(body, width=92, subsequent_indent=indent) or [""]
    wrapped.extend(chunks)

# PDF layout (A4)
page_w, page_h = 595, 842
left, top = 40, 50
line_h = 14
usable_h = page_h - top - 40
lines_per_page = usable_h // line_h

pages = []
for i in range(0, len(wrapped), lines_per_page):
    pages.append(wrapped[i:i+lines_per_page])

def esc(text: str) -> str:
    return text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

objects = []
# 1: Catalog, 2: Pages
objects.append("<< /Type /Catalog /Pages 2 0 R >>")

kids_refs = []
page_obj_numbers = []
content_obj_numbers = []
font_obj_num = 3
obj_num = 4

for page in pages:
    page_obj = obj_num
    content_obj = obj_num + 1
    page_obj_numbers.append(page_obj)
    content_obj_numbers.append(content_obj)
    kids_refs.append(f"{page_obj} 0 R")
    obj_num += 2

objects.append(f"<< /Type /Pages /Kids [{' '.join(kids_refs)}] /Count {len(pages)} >>")
objects.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

for page_idx, lines in enumerate(pages):
    page_obj = page_obj_numbers[page_idx]
    content_obj = content_obj_numbers[page_idx]

    page_dict = f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_w} {page_h}] /Resources << /Font << /F1 {font_obj_num} 0 R >> >> /Contents {content_obj} 0 R >>"
    objects.append(page_dict)

    text_cmds = ["BT", f"/F1 10 Tf", f"{left} {page_h - top} Td"]
    for idx, line in enumerate(lines):
        if idx == 0:
            text_cmds.append(f"({esc(line)}) Tj")
        else:
            text_cmds.append(f"0 -{line_h} Td ({esc(line)}) Tj")
    text_cmds.append("ET")
    stream = "\n".join(text_cmds).encode("latin-1", errors="replace")
    content = f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream"
    objects.append(content)

pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]

for i, obj in enumerate(objects, start=1):
    offsets.append(len(pdf))
    pdf.extend(f"{i} 0 obj\n".encode("ascii"))
    if isinstance(obj, bytes):
        pdf.extend(obj)
        pdf.extend(b"\n")
    else:
        pdf.extend(obj.encode("latin-1", errors="replace"))
        pdf.extend(b"\n")
    pdf.extend(b"endobj\n")

xref_pos = len(pdf)
count = len(objects) + 1
pdf.extend(f"xref\n0 {count}\n".encode("ascii"))
pdf.extend(b"0000000000 65535 f \n")
for off in offsets[1:]:
    pdf.extend(f"{off:010d} 00000 n \n".encode("ascii"))

pdf.extend(f"trailer\n<< /Size {count} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("ascii"))
out.write_bytes(pdf)
print(f"Generated {out}")
