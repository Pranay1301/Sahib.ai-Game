from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "phase6"
FRAME_SIZE = 96
FRAME_COUNT = 4


CHARACTERS = [
    {
        "key": "hero",
        "source": ROOT / "Hero.jpeg",
        "output": OUT_DIR / "hero-commander-sprite.png",
        "target_height": 86,
        "effect": "rifle",
    },
    {
        "key": "alien_hunter",
        "source": ROOT / "Alien Hunter.png",
        "output": OUT_DIR / "alien-hunter-sprite.png",
        "target_height": 88,
        "effect": "claws",
    },
    {
        "key": "hunter_exosuit",
        "source": ROOT / "Hunter Exosuit.png",
        "output": OUT_DIR / "hunter-exosuit-sprite.png",
        "target_height": 84,
        "effect": "core_rifle",
    },
    {
        "key": "heavy_brute",
        "source": ROOT / "Heavy Brute.jpg",
        "output": OUT_DIR / "heavy-brute-sprite.png",
        "target_height": 82,
        "effect": "slam",
    },
    {
        "key": "breaker_bot",
        "source": ROOT / "Breaker Bot.png",
        "output": OUT_DIR / "breaker-bot-sprite.png",
        "target_height": 82,
        "effect": "breach",
    },
]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for character in CHARACTERS:
        subject = load_subject(character["source"], character["target_height"])
        sheet = Image.new("RGBA", (FRAME_SIZE * FRAME_COUNT, FRAME_SIZE), (0, 0, 0, 0))
        for frame_index in range(FRAME_COUNT):
            frame = create_frame(subject, frame_index, character["effect"])
            sheet.alpha_composite(frame, (frame_index * FRAME_SIZE, 0))
        sheet.save(character["output"])
        print(f"Generated {character['output']}")


def load_subject(source: Path, target_height: int) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    bbox = find_subject_bbox(image)
    cropped = image.crop(bbox)
    alpha = create_alpha_mask(cropped)
    cropped.putalpha(alpha)

    scale = target_height / cropped.height
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), target_height),
        Image.Resampling.LANCZOS,
    )

    if resized.width > FRAME_SIZE - 10:
        scale = (FRAME_SIZE - 10) / resized.width
        resized = resized.resize(
            (FRAME_SIZE - 10, max(1, round(resized.height * scale))),
            Image.Resampling.LANCZOS,
        )

    return resized


def find_subject_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    small, scale_x, scale_y = downsample_mask(image)
    width, height = small.size
    pixels = small.load()
    visited = bytearray(width * height)
    best_count = 0
    best_bbox = (0, 0, width - 1, height - 1)

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] == 0:
                continue

            count, bbox = flood_component(pixels, visited, width, height, x, y)
            if count > best_count:
                best_count = count
                best_bbox = bbox

    min_x, min_y, max_x, max_y = best_bbox
    pad_x = max(8, round((max_x - min_x + 1) * 0.08))
    pad_y = max(8, round((max_y - min_y + 1) * 0.08))

    return (
        max(0, int((min_x - pad_x) * scale_x)),
        max(0, int((min_y - pad_y) * scale_y)),
        min(image.width, int((max_x + pad_x + 1) * scale_x)),
        min(image.height, int((max_y + pad_y + 1) * scale_y)),
    )


def downsample_mask(image: Image.Image) -> tuple[Image.Image, float, float]:
    max_edge = 460
    scale = min(1, max_edge / max(image.size))
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    small = image.resize(size, Image.Resampling.BILINEAR).convert("RGB")
    mask = Image.new("L", size, 0)
    source = small.load()
    target = mask.load()

    for y in range(size[1]):
        for x in range(size[0]):
            r, g, b = source[x, y]
            bright = max(r, g, b)
            contrast = bright - min(r, g, b)
            if bright > 26 or contrast > 18:
                target[x, y] = 255

    mask = mask.filter(ImageFilter.MaxFilter(5))
    return mask, image.width / size[0], image.height / size[1]


def flood_component(pixels, visited: bytearray, width: int, height: int, start_x: int, start_y: int):
    queue = deque([(start_x, start_y)])
    visited[start_y * width + start_x] = 1
    count = 0
    min_x = max_x = start_x
    min_y = max_y = start_y

    while queue:
        x, y = queue.popleft()
        count += 1
        min_x = min(min_x, x)
        max_x = max(max_x, x)
        min_y = min(min_y, y)
        max_y = max(max_y, y)

        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height:
                continue
            index = ny * width + nx
            if visited[index] or pixels[nx, ny] == 0:
                continue
            visited[index] = 1
            queue.append((nx, ny))

    return count, (min_x, min_y, max_x, max_y)


def create_alpha_mask(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    mask = Image.new("L", image.size, 0)
    source = rgb.load()
    target = mask.load()

    for y in range(image.height):
        for x in range(image.width):
            r, g, b = source[x, y]
            bright = max(r, g, b)
            contrast = bright - min(r, g, b)
            if bright > 18 or contrast > 16:
                target[x, y] = 255

    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.45))
    return mask


def create_frame(subject: Image.Image, frame_index: int, effect: str) -> Image.Image:
    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    offsets = [(0, 0), (-2, 2), (1, -1), (2, 2)]
    rotations = [0, -3, 2, 3]
    scales = [1.0, 0.98, 1.03, 0.99]

    scale = scales[frame_index]
    sprite = subject.resize(
        (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
        Image.Resampling.LANCZOS,
    )
    sprite = sprite.rotate(rotations[frame_index], resample=Image.Resampling.BICUBIC, expand=True)

    x = (FRAME_SIZE - sprite.width) // 2 + offsets[frame_index][0]
    y = FRAME_SIZE - sprite.height - 5 + offsets[frame_index][1]
    frame.alpha_composite(sprite, (x, y))

    draw = ImageDraw.Draw(frame, "RGBA")
    if frame_index == 2:
        draw_attack_effect(draw, effect)

    draw.ellipse((28, 84, 68, 92), fill=(0, 0, 0, 46))
    return frame


def draw_attack_effect(draw: ImageDraw.ImageDraw, effect: str) -> None:
    if effect in {"rifle", "core_rifle"}:
        color = (255, 214, 92, 230) if effect == "rifle" else (245, 80, 96, 220)
        draw.line((58, 46, 83, 38), fill=color, width=3)
        draw.ellipse((80, 35, 90, 44), fill=(255, 244, 160, 170))
        return

    if effect == "claws":
        draw.arc((24, 24, 76, 74), 300, 45, fill=(222, 86, 255, 210), width=4)
        return

    if effect == "slam":
        draw.line((31, 70, 65, 82), fill=(255, 80, 92, 210), width=5)
        draw.line((38, 63, 72, 78), fill=(255, 136, 96, 150), width=3)
        return

    if effect == "breach":
        draw.rectangle((64, 54, 82, 66), fill=(255, 60, 72, 160))
        draw.line((56, 60, 88, 60), fill=(255, 44, 68, 220), width=3)


if __name__ == "__main__":
    main()
