export const IMAGE_BATTLEFIELD_CAMERA = Object.freeze({
  zoom: 4
});

export function getImageBattlefieldCamera(heroPosition, viewport, worldBounds, zoom = IMAGE_BATTLEFIELD_CAMERA.zoom) {
  const safeZoom = Math.max(1, zoom);
  const viewportWidth = Math.max(1, viewport.width);
  const viewportHeight = Math.max(1, viewport.height);
  const scale =
    Math.max(
      viewportWidth / Math.max(1, worldBounds.width),
      viewportHeight / Math.max(1, worldBounds.height)
    ) * safeZoom;
  const layerWidth = worldBounds.width * scale;
  const layerHeight = worldBounds.height * scale;
  const heroScreenX = heroPosition.x * scale;
  const heroScreenY = heroPosition.y * scale;

  return {
    zoom: safeZoom,
    scale,
    layerWidth,
    layerHeight,
    offsetX: clamp(heroScreenX - viewportWidth * 0.5, 0, layerWidth - viewportWidth),
    offsetY: clamp(heroScreenY - viewportHeight * 0.52, 0, layerHeight - viewportHeight)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
