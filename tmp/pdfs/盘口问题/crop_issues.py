from pathlib import Path
from PIL import Image


source = Image.open("tmp/pdfs/盘口问题/page-01.png")
out_dir = Path("tmp/pdfs/盘口问题/crops")
out_dir.mkdir(parents=True, exist_ok=True)

boxes = {
    1: (0, 0, 295, 420),
    2: (290, 0, 595, 420),
    3: (590, 0, 900, 420),
    4: (890, 0, 1190, 420),
    5: (0, 410, 300, 805),
    6: (290, 410, 610, 805),
    7: (600, 410, 900, 805),
    8: (890, 410, 1190, 805),
    9: (0, 790, 250, 1175),
    10: (240, 790, 505, 1175),
    11: (495, 790, 720, 1175),
    12: (700, 790, 940, 1175),
    13: (920, 790, 1090, 1175),
    14: (1060, 790, 1310, 1175),
    15: (0, 1155, 245, 1405),
    16: (230, 1155, 480, 1405),
    17: (465, 1155, 720, 1405),
    18: (700, 1155, 970, 1405),
    19: (950, 1155, 1310, 1405),
}

for number, box in boxes.items():
    crop = source.crop(box)
    crop.save(out_dir / f"issue-{number:02d}.png")

thumbs = []
for number in boxes:
    image = Image.open(out_dir / f"issue-{number:02d}.png").convert("RGB")
    image.thumbnail((260, 240))
    tile = Image.new("RGB", (280, 280), "white")
    tile.paste(image, ((280 - image.width) // 2, 30))
    thumbs.append(tile)

sheet = Image.new("RGB", (1120, 1400), "#dddddd")
for index, tile in enumerate(thumbs):
    sheet.paste(tile, ((index % 4) * 280, (index // 4) * 280))
sheet.save(out_dir / "contact-sheet.png")

print(f"created={len(boxes)}")
