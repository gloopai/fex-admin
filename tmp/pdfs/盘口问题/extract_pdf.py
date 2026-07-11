from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium


source = Path("/Users/evanqi/Downloads/盘口问题.pdf")
out_dir = Path("tmp/pdfs/盘口问题")

with pdfplumber.open(source) as pdf:
    text_parts = []
    for index, page in enumerate(pdf.pages, start=1):
        text_parts.append(f"\n===== 第 {index} 页 =====\n")
        text_parts.append(page.extract_text(layout=True) or "")
    (out_dir / "text.txt").write_text("\n".join(text_parts), encoding="utf-8")

pdf = pdfium.PdfDocument(str(source))
for index in range(len(pdf)):
    page = pdf[index]
    bitmap = page.render(scale=2.2)
    image = bitmap.to_pil()
    image.save(out_dir / f"page-{index + 1:02d}.png")

print(f"pages={len(pdf)}")
