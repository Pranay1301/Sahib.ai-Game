from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "phase6"
OUT_DIR = SOURCE_DIR / "runtime"
CELL_SIZE = 128

SHEETS = [
    ("hero_walk.png", "hero_walk_runtime.png", 6, 8),
    ("hero_shoot.png", "hero_shoot_runtime.png", 4, 8),
    ("alien_hunter_walk.png", "alien_hunter_walk_runtime.png", 6, 8),
    ("alien_hunter_attack.png", "alien_hunter_attack_runtime.png", 4, 8),
    ("hunter_exosuit_walk.png", "hunter_exosuit_walk_runtime.png", 6, 8),
    ("hunter_exosuit_attack.png", "hunter_exosuit_attack_runtime.png", 4, 8),
    ("heavy_brute_walk.png", "heavy_brute_walk_runtime.png", 6, 8),
    ("heavy_brute_attack.png", "heavy_brute_attack_runtime.png", 4, 8),
    ("breaker_bot_walk.png", "breaker_bot_walk_runtime.png", 6, 8),
    ("breaker_bot_attack.png", "breaker_bot_attack_runtime.png", 4, 8),
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for source_name, output_name, columns, rows in SHEETS:
        source_path = SOURCE_DIR / source_name
        if not source_path.exists():
            raise FileNotFoundError(f"Missing sprite source: {source_path}")

        source = Image.open(source_path).convert("RGB")
        output = normalize_sheet(source, columns, rows)

        output.save(OUT_DIR / output_name)
        print(f"wrote {OUT_DIR / output_name}")


def normalize_sheet(source, columns, rows):
    source = remove_checkerboard_background(source)
    output = Image.new("RGBA", (columns * CELL_SIZE, rows * CELL_SIZE), (0, 0, 0, 0))

    for row in range(rows):
        for column in range(columns):
            frame = frame_from_cell(source, columns, rows, column, row)
            output.alpha_composite(frame, (column * CELL_SIZE, row * CELL_SIZE))

    return output


def frame_from_cell(source, columns, rows, column, row):
    width, height = source.size
    left = round(column * width / columns)
    top = round(row * height / rows)
    right = round((column + 1) * width / columns)
    bottom = round((row + 1) * height / rows)
    return pad_frame_to_cell(source.crop((left, top, right, bottom)))


def pad_frame_to_cell(frame):
    frame = frame.convert("RGBA")
    frame = remove_border_fragments(frame)
    target_size = CELL_SIZE - 24
    scale = min(target_size / frame.width, target_size / frame.height)
    resized = frame.resize(
        (max(1, round(frame.width * scale)), max(1, round(frame.height * scale))),
        Image.Resampling.LANCZOS,
    )
    resized = remove_checkerboard_background(resized)

    cell = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
    x = (CELL_SIZE - resized.width) // 2
    y = (CELL_SIZE - resized.height) // 2
    cell.alpha_composite(resized, (x, y))
    return cell


def remove_border_fragments(frame):
    components = find_alpha_components(frame)
    if not components:
        return frame

    largest = max(components, key=lambda component: component["area"])
    keep = []
    for component in components:
        if component is largest:
            keep.append(component)
            continue

        if should_keep_component(component, largest, frame.size):
            keep.append(component)

    return frame_from_original_components(frame, keep)


def frame_from_original_components(source, components):
    source_pixels = source.load()
    output = Image.new("RGBA", source.size, (0, 0, 0, 0))
    output_pixels = output.load()
    for component in components:
        for x, y in component["pixels"]:
            output_pixels[x, y] = source_pixels[x, y]
    return output


def remove_checkerboard_background(frame):
    rgba = frame.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha <= 8:
                pixels[x, y] = (red, green, blue, 0)
                continue

            brightest = max(red, green, blue)
            darkest = min(red, green, blue)
            is_neutral_light = darkest >= 204 and brightest - darkest <= 36
            if is_neutral_light:
                pixels[x, y] = (red, green, blue, 0)
            else:
                pixels[x, y] = (red, green, blue, alpha)

    return rgba


def find_alpha_components(frame):
    pixels = frame.load()
    width, height = frame.size
    visited = bytearray(width * height)
    components = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y][3] <= 8:
                visited[index] = 1
                continue

            stack = [(x, y)]
            visited[index] = 1
            component_pixels = []
            min_x = max_x = x
            min_y = max_y = y

            while stack:
                current_x, current_y = stack.pop()
                component_pixels.append((current_x, current_y))
                min_x = min(min_x, current_x)
                max_x = max(max_x, current_x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)

                for next_x, next_y in neighbors(current_x, current_y, width, height):
                    next_index = next_y * width + next_x
                    if visited[next_index]:
                        continue

                    visited[next_index] = 1
                    if pixels[next_x, next_y][3] > 8:
                        stack.append((next_x, next_y))

            if len(component_pixels) >= 6:
                components.append(
                    {
                        "id": len(components),
                        "area": len(component_pixels),
                        "bbox": (min_x, min_y, max_x, max_y),
                        "pixels": component_pixels,
                    }
                )

    return components


def neighbors(x, y, width, height):
    for offset_y in (-1, 0, 1):
        for offset_x in (-1, 0, 1):
            if offset_x == 0 and offset_y == 0:
                continue
            next_x = x + offset_x
            next_y = y + offset_y
            if 0 <= next_x < width and 0 <= next_y < height:
                yield next_x, next_y


def should_keep_component(component, primary, size):
    if component is primary:
        return True

    primary_area = primary["area"]
    primary_width = primary["bbox"][2] - primary["bbox"][0] + 1
    primary_height = primary["bbox"][3] - primary["bbox"][1] + 1
    primary_extent = max(primary_width, primary_height)
    if component["area"] < max(10, primary_area * 0.012):
        return False

    gap = bbox_gap(component["bbox"], primary["bbox"])
    center_x, center_y = bbox_center(component["bbox"])
    primary_center_x, primary_center_y = bbox_center(primary["bbox"])
    center_distance = ((center_x - primary_center_x) ** 2 + (center_y - primary_center_y) ** 2) ** 0.5
    max_allowed_gap = max(18, primary_extent * 0.2)
    if gap <= max_allowed_gap and center_distance <= primary_extent * 0.8:
        return True

    # Keep larger nearby effects such as muzzle flashes, but discard pieces
    # belonging to neighboring animation frames.
    return component["area"] >= primary_area * 0.055 and center_distance <= primary_extent * 1.05


def bbox_gap(a, b):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    horizontal_gap = max(0, max(bx1 - ax2, ax1 - bx2))
    vertical_gap = max(0, max(by1 - ay2, ay1 - by2))
    return (horizontal_gap * horizontal_gap + vertical_gap * vertical_gap) ** 0.5


def bbox_center(bbox):
    x1, y1, x2, y2 = bbox
    return ((x1 + x2) / 2, (y1 + y2) / 2)


def fit_frame_to_cell(frame):
    bbox = frame.getbbox()
    if not bbox:
        return Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))

    cropped = frame.crop(bbox)
    max_sprite_size = CELL_SIZE - 10
    scale = min(max_sprite_size / cropped.width, max_sprite_size / cropped.height, 1)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )

    cell = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
    x = (CELL_SIZE - resized.width) // 2
    y = CELL_SIZE - resized.height - 4
    cell.alpha_composite(resized, (x, y))
    return cell


if __name__ == "__main__":
    main()
