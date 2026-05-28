import React, { useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import {
  ENEMY_CORE_POSITION,
  PLAYER_CORE_POSITION,
  WORLD_BOUNDS
} from "../game/mapLayout.js";
import { getImageBattlefieldCamera } from "../game/imageCamera.js";
import { DOOR_SIGNAL_SECONDS } from "../game/doorEncounters.js";
import { getEnemyStats } from "../game/enemyBehavior.js";
import { getCorePercent } from "../game/matchState.js";
import {
  WALL_SPRITE_FRAME_COUNT,
  WALL_TOOL_CONFIGS,
  WALL_TOOL_TYPES
} from "../game/wallSystem.js";
import { SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS } from "../game/specialWeapons.js";
import {
  SPECIAL_PICKUP_READABILITY_ACCENT
} from "../game/visualReadability.js";
import { getCharacterModelSpec } from "../game/characterModels.js";
import { PHASE6_CHARACTER_MODEL_MODULES } from "../assets/characterModelModules.js";
import { CharacterModelOverlay } from "./CharacterModelOverlay.js";

const MAP_IMAGE = require("../../map.png");
const DOOR_SPRITE_SHEET = require("../../assets/phase5/mechanical-door-sprite.png");
const WALL_SPRITE_SHEETS = Object.freeze({
  [WALL_TOOL_TYPES.BLOCK]: require("../../assets/phase9/runtime/block_wall_runtime.png")
});

const CORE_BAR_WIDTH = 60;
const CORE_BAR_HEIGHT = 7;
const DOOR_SPRITE_FRAME_COUNT = 4;
const DOOR_OPEN_FRAME_SECONDS = 0.18;
const DOOR_ANIMATION_SECONDS = DOOR_OPEN_FRAME_SECONDS * (DOOR_SPRITE_FRAME_COUNT - 1);
const DOOR_SIGNAL_WIDTH_SCALE = 0.72;
const DOOR_SIGNAL_HEIGHT_SCALE = 0.85;
const DOOR_SIGNAL_MIN_WIDTH = 34;
const DOOR_SIGNAL_MIN_HEIGHT = 12;

export function ImageBattlefield({
  coreDefense = null,
  doorEncounters,
  hero,
  match,
  projectiles = [],
  specialWeapons = null,
  wallPlacementPreview = null,
  wallSystem = null
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const ready = layout.width > 0 && layout.height > 0;
  const camera = useMemo(() => {
    if (!ready) {
      return null;
    }

    return getImageBattlefieldCamera(hero.position, layout, WORLD_BOUNDS);
  }, [hero.position, layout, ready]);

  const markers = useMemo(() => {
    if (!ready || !camera) {
      return null;
    }

    return {
      hero: worldToScreen(hero.position, camera),
      playerCore: worldToScreen(PLAYER_CORE_POSITION, camera),
      enemyCore: worldToScreen(ENEMY_CORE_POSITION, camera)
    };
  }, [camera, hero.position, ready]);
  return (
    <View
      style={styles.root}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      {ready && camera && markers && (
        <View
          pointerEvents="none"
          style={[
            styles.cameraLayer,
            {
              left: -camera.offsetX,
              top: -camera.offsetY,
              width: camera.layerWidth,
              height: camera.layerHeight
            }
          ]}
        >
          <Image source={MAP_IMAGE} resizeMode="stretch" style={styles.mapImage} />
          {[...(doorEncounters?.doorSignals ?? []), ...(coreDefense?.doorSignals ?? [])].map((signal) => (
            <DoorSignal key={signal.id} layout={camera} signal={signal} />
          ))}
          {(wallSystem?.activeWalls ?? []).map((wall) => (
            <WallSprite key={wall.id} layout={camera} wall={wall} />
          ))}
          {wallPlacementPreview && (
            <PlacementPreview layout={camera} placement={wallPlacementPreview} />
          )}
          <CharacterModelOverlay
            camera={camera}
            enemies={doorEncounters?.spawnedEnemies ?? []}
            hero={hero}
            viewport={layout}
          />
          {(doorEncounters?.spawnedEnemies ?? []).map((enemy) => (
            <EnemySprite enemy={enemy} key={enemy.id} layout={camera} />
          ))}
          {projectiles.map((projectile) => (
            <ProjectileTrail key={projectile.id} layout={camera} projectile={projectile} />
          ))}
          {(specialWeapons?.activePickups ?? []).map((pickup) => (
            <SpecialWeaponPickup key={pickup.id} layout={camera} pickup={pickup} />
          ))}
          <CoreHealthBar
            color="#4ea9d8"
            percent={getCorePercent(match.playerCoreHp, match.coreMaxHp)}
            position={markers.playerCore}
          />
          <CoreHealthBar
            color="#f05a60"
            percent={getCorePercent(match.enemyCoreHp, match.coreMaxHp)}
            position={markers.enemyCore}
          />
        </View>
      )}
    </View>
  );
}

function WallSprite({ layout, wall }) {
  const position = worldToScreen(wall.position, layout);
  const config = WALL_TOOL_CONFIGS[wall.type];
  const hpPercent = Math.max(0, Math.min(1, wall.hp / wall.maxHp));
  const frameIndex = Math.min(
    WALL_SPRITE_FRAME_COUNT - 1,
    Math.max(0, Math.floor((1 - hpPercent) * WALL_SPRITE_FRAME_COUNT))
  );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wallSprite,
        {
          left: position.x - config.renderWidth / 2,
          top: position.y - config.renderHeight / 2,
          width: config.renderWidth,
          height: config.renderHeight,
          transform: [{ rotate: `${wall.rotation}deg` }]
        }
      ]}
    >
      <WallFrame
        frameIndex={frameIndex}
        height={config.renderHeight}
        source={WALL_SPRITE_SHEETS[wall.type]}
        width={config.renderWidth}
      />
      <View style={styles.wallHpTrack}>
        <View style={[styles.wallHpFill, { width: `${Math.round(hpPercent * 100)}%` }]} />
      </View>
    </View>
  );
}

function PlacementPreview({ layout, placement }) {
  const position = worldToScreen(placement.position, layout);
  const config = WALL_TOOL_CONFIGS[placement.toolType];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.placementPreview,
        placement.valid ? styles.placementPreviewValid : styles.placementPreviewInvalid,
        {
          left: position.x - config.renderWidth / 2,
          top: position.y - config.renderHeight / 2,
          width: config.renderWidth,
          height: config.renderHeight,
          transform: [{ rotate: `${placement.rotation}deg` }]
        }
      ]}
    >
      <View
        style={[
          styles.placementPreviewGlow,
          placement.valid ? styles.placementPreviewGlowValid : styles.placementPreviewGlowInvalid
        ]}
      />
      <WallFrame
        frameIndex={0}
        height={config.renderHeight}
        source={WALL_SPRITE_SHEETS[placement.toolType]}
        width={config.renderWidth}
      />
    </View>
  );
}

function WallFrame({ frameIndex, height, source, width }) {
  return (
    <View style={[styles.wallFrame, { width, height }]}>
      <Image
        resizeMode="stretch"
        source={source}
        style={[
          styles.wallSpriteSheet,
          {
            width: width * WALL_SPRITE_FRAME_COUNT,
            height,
            transform: [{ translateX: -frameIndex * width }]
          }
        ]}
      />
    </View>
  );
}

function ProjectileTrail({ layout, projectile }) {
  const start = worldToScreen(projectile.previousPosition ?? projectile.position, layout);
  const end = worldToScreen(projectile.position, layout);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(14, Math.sqrt(dx * dx + dy * dy));
  const angle = Math.atan2(dy, dx);
  const lifetimeSeconds = projectile.lifetimeSeconds ?? 0;
  const opacity =
    lifetimeSeconds > 0
      ? Math.max(0.22, 1 - (projectile.ageSeconds ?? 0) / lifetimeSeconds)
      : 1;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.projectileTrail,
        {
          left: start.x + dx / 2 - length / 2,
          top: start.y + dy / 2 - 1.5,
          opacity,
          width: length,
          transform: [{ rotate: `${angle}rad` }]
        }
      ]}
    />
  );
}

function SpecialWeaponPickup({ layout, pickup }) {
  const position = worldToScreen(pickup.position, layout);
  const opacity = Math.max(
    0.38,
    Math.min(1, pickup.remainingSeconds / SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS)
  );

  return (
    <View
      pointerEvents="none"
      style={[
        styles.specialWeaponPickup,
        {
          left: position.x - 18,
          top: position.y - 18,
          opacity,
          borderColor: SPECIAL_PICKUP_READABILITY_ACCENT,
          shadowColor: SPECIAL_PICKUP_READABILITY_ACCENT
        }
      ]}
    >
      <View style={styles.specialWeaponPickupCore} />
    </View>
  );
}

function DoorSignal({ layout, signal }) {
  const position = worldToScreen(signal.center, layout);
  const width = Math.max(
    DOOR_SIGNAL_MIN_WIDTH,
    (signal.width / WORLD_BOUNDS.width) * layout.layerWidth * DOOR_SIGNAL_WIDTH_SCALE
  );
  const height = Math.max(
    DOOR_SIGNAL_MIN_HEIGHT,
    (signal.height / WORLD_BOUNDS.height) * layout.layerHeight * DOOR_SIGNAL_HEIGHT_SCALE
  );
  const elapsedSeconds = DOOR_SIGNAL_SECONDS - signal.remainingSeconds;
  const frameIndex = getDoorFrameIndex(elapsedSeconds, signal.remainingSeconds);
  const opacity = Math.max(0.55, signal.remainingSeconds / DOOR_SIGNAL_SECONDS);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.doorSignal,
        {
          left: position.x - width / 2,
          top: position.y - height / 2,
          width,
          height,
          opacity,
          transform: [{ rotate: `${signal.rotation}deg` }]
        }
      ]}
    >
      <Image
        resizeMode="stretch"
        source={DOOR_SPRITE_SHEET}
        style={[
          styles.doorSpriteSheet,
          {
            width: width * DOOR_SPRITE_FRAME_COUNT,
            height,
            transform: [{ translateX: -frameIndex * width }]
          }
        ]}
      />
    </View>
  );
}

function getDoorFrameIndex(elapsedSeconds, remainingSeconds) {
  if (elapsedSeconds < DOOR_ANIMATION_SECONDS) {
    return Math.min(
      DOOR_SPRITE_FRAME_COUNT - 1,
      Math.max(0, Math.floor(elapsedSeconds / DOOR_OPEN_FRAME_SECONDS))
    );
  }

  if (remainingSeconds < DOOR_ANIMATION_SECONDS) {
    return Math.max(
      0,
      Math.min(DOOR_SPRITE_FRAME_COUNT - 1, Math.floor(remainingSeconds / DOOR_OPEN_FRAME_SECONDS))
    );
  }

  return DOOR_SPRITE_FRAME_COUNT - 1;
}

function EnemySprite({ enemy, layout }) {
  const position = worldToScreen(enemy.position, layout);
  const stats = getEnemyStats(enemy.type);
  const modelSpec = getCharacterModelSpec(enemy.type);
  const hasRegisteredModel = Boolean(PHASE6_CHARACTER_MODEL_MODULES[modelSpec.assetId]);
  const size = stats.renderSize;
  const hpPercent = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));

  return (
    <View
      accessibilityLabel={modelSpec.label}
      accessibilityHint={hasRegisteredModel ? "Phase 6 GLB registered" : undefined}
      pointerEvents="none"
      style={[
        styles.characterSprite,
        {
          left: position.x - size / 2,
          top: position.y - size * 0.82,
          width: size,
          height: size
        }
      ]}
    >
      <View style={styles.enemyHpTrack}>
        <View style={[styles.enemyHpFill, { width: `${Math.round(hpPercent * 100)}%` }]} />
      </View>
    </View>
  );
}

function CoreHealthBar({ color, percent, position }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.coreBar,
        {
          left: position.x - CORE_BAR_WIDTH / 2,
          top: position.y - 68
        }
      ]}
    >
      <View
        style={[
          styles.coreBarFill,
          {
            backgroundColor: color,
            width: `${Math.round(percent * 100)}%`
          }
        ]}
      />
    </View>
  );
}

function worldToScreen(position, layout) {
  return {
    x: (position.x / WORLD_BOUNDS.width) * layout.layerWidth,
    y: (position.y / WORLD_BOUNDS.height) * layout.layerHeight
  };
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#171019"
  },
  cameraLayer: {
    position: "absolute",
    overflow: "hidden"
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  doorSignal: {
    position: "absolute",
    zIndex: 2,
    overflow: "hidden",
    borderRadius: 5,
    shadowColor: "#f05a60",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6
  },
  doorSpriteSheet: {
    position: "absolute",
    left: 0,
    top: 0
  },
  characterSprite: {
    position: "absolute",
    zIndex: 3,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  enemyHpTrack: {
    position: "absolute",
    top: -6,
    width: 30,
    height: 4,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(12, 8, 14, 0.78)"
  },
  enemyHpFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#ff5d68"
  },
  projectileTrail: {
    position: "absolute",
    zIndex: 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#f4d36f",
    shadowColor: "#f4d36f",
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7
  },
  specialWeaponPickup: {
    position: "absolute",
    zIndex: 4,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#7cd4ff",
    backgroundColor: "rgba(26, 42, 63, 0.74)",
    shadowColor: "#7cd4ff",
    shadowOpacity: 0.85,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8
  },
  specialWeaponPickupCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#f4d36f"
  },
  wallSprite: {
    position: "absolute",
    zIndex: 4,
    overflow: "visible",
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7
  },
  wallFrame: {
    overflow: "hidden"
  },
  wallSpriteSheet: {
    position: "absolute",
    left: 0,
    top: 0
  },
  wallHpTrack: {
    position: "absolute",
    left: 10,
    right: 10,
    top: -7,
    height: 4,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(12, 8, 14, 0.72)"
  },
  wallHpFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#f4d36f"
  },
  placementPreview: {
    position: "absolute",
    zIndex: 6,
    overflow: "visible"
  },
  placementPreviewValid: {
    opacity: 0.78
  },
  placementPreviewInvalid: {
    opacity: 0.46
  },
  placementPreviewGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 2
  },
  placementPreviewGlowValid: {
    borderColor: "#6af2a2",
    backgroundColor: "rgba(106, 242, 162, 0.14)"
  },
  placementPreviewGlowInvalid: {
    borderColor: "#f05a60",
    backgroundColor: "rgba(240, 90, 96, 0.14)"
  },
  coreBar: {
    position: "absolute",
    zIndex: 4,
    width: CORE_BAR_WIDTH,
    height: CORE_BAR_HEIGHT,
    overflow: "hidden",
    borderRadius: CORE_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: "rgba(246, 234, 216, 0.5)",
    backgroundColor: "rgba(16, 12, 20, 0.72)"
  },
  coreBarFill: {
    height: "100%",
    borderRadius: CORE_BAR_HEIGHT / 2
  }
});
