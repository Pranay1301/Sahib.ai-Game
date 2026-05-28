import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

import { CORE_IDS, MATCH_STATUS } from "./src/game/constants.js";
import {
  createDoorEncounterState,
  setDoorEncounterEnemies,
  tickDoorEncounters
} from "./src/game/doorEncounters.js";
import {
  createCorePressureState,
  tickCorePressure
} from "./src/game/corePressure.js";
import {
  createCoreDefenseState,
  tickCoreDefense
} from "./src/game/coreDefense.js";
import {
  tickEnemyBehavior
} from "./src/game/enemyBehavior.js";
import { getImageBattlefieldCamera } from "./src/game/imageCamera.js";
import {
  RIFLE,
  createHeroCombatState,
  damageHero,
  startReload,
  tickHeroCombat
} from "./src/game/heroCombat.js";
import {
  consumeHeartForQuickRound,
  createHeartState,
  tickHearts
} from "./src/game/hearts.js";
import {
  createMatchState,
  damageCore,
  pauseForAppInterruption,
  recordEnemyKills,
  startMatch,
  tickMatch,
  togglePause
} from "./src/game/matchState.js";
import {
  calculateJoystickInput,
  getJoystickRadius,
  isPointInsideCircleControl,
  isPointInsideJoystickControl,
  smoothJoystickVector
} from "./src/game/joystick.js";
import { PLAYER_CORE_ATTACK_POSITION, WORLD_BOUNDS } from "./src/game/mapLayout.js";
import {
  addProjectileSpawns,
  createProjectileState,
  tickProjectiles
} from "./src/game/projectiles.js";
import {
  createSpecialWeaponDropState,
  tickSpecialWeaponDrops
} from "./src/game/specialWeapons.js";
import { createBattleResult } from "./src/game/quickRoundResult.js";
import {
  WALL_TOOL_CONFIGS,
  WALL_TOOL_TYPES,
  applyWallDamageEvents,
  createWallSystemState,
  getFreePlacementPreview,
  placeSelectedWallTool,
  selectWallTool,
  tickWallSystem
} from "./src/game/wallSystem.js";
import { ImageBattlefield } from "./src/ui/ImageBattlefield.js";

const TICK_MS = 50;
const JOYSTICK_SIZE = 132;
const JOYSTICK_KNOB_SIZE = 54;

const EMPTY_CONTROLS = Object.freeze({
  moveX: 0,
  moveY: 0,
  aimX: 0,
  aimY: 0,
  isFiring: false
});

export default function App() {
  const [match, setMatch] = useState(() => createMatchState());
  const [hero, setHero] = useState(() => createHeroCombatState());
  const [doorEncounters, setDoorEncounters] = useState(() => createDoorEncounterState());
  const [corePressure, setCorePressure] = useState(() => createCorePressureState());
  const [coreDefense, setCoreDefense] = useState(() => createCoreDefenseState());
  const [projectiles, setProjectiles] = useState(() => createProjectileState());
  const [specialWeapons, setSpecialWeapons] = useState(() => createSpecialWeaponDropState());
  const [wallSystem, setWallSystem] = useState(() => createWallSystemState());
  const [hearts, setHearts] = useState(() => createHeartState());
  const [battleResult, setBattleResult] = useState(null);
  const [currentRewardMode, setCurrentRewardMode] = useState(null);
  const [wallPlacementPreview, setWallPlacementPreview] = useState(null);
  const matchRef = useRef(match);
  const heroRef = useRef(hero);
  const doorEncountersRef = useRef(doorEncounters);
  const corePressureRef = useRef(corePressure);
  const coreDefenseRef = useRef(coreDefense);
  const projectilesRef = useRef(projectiles);
  const specialWeaponsRef = useRef(specialWeapons);
  const wallSystemRef = useRef(wallSystem);
  const heartsRef = useRef(hearts);
  const battleResultRef = useRef(battleResult);
  const currentRewardModeRef = useRef(currentRewardMode);
  const wallPlacementPreviewRef = useRef(wallPlacementPreview);
  const controlsRef = useRef({ ...EMPTY_CONTROLS });
  const { width, height } = useWindowDimensions();
  const isLandscape = width >= height;

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    heroRef.current = hero;
  }, [hero]);

  useEffect(() => {
    doorEncountersRef.current = doorEncounters;
  }, [doorEncounters]);

  useEffect(() => {
    corePressureRef.current = corePressure;
  }, [corePressure]);

  useEffect(() => {
    coreDefenseRef.current = coreDefense;
  }, [coreDefense]);

  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    specialWeaponsRef.current = specialWeapons;
  }, [specialWeapons]);

  useEffect(() => {
    wallSystemRef.current = wallSystem;
  }, [wallSystem]);

  useEffect(() => {
    heartsRef.current = hearts;
  }, [hearts]);

  useEffect(() => {
    battleResultRef.current = battleResult;
  }, [battleResult]);

  useEffect(() => {
    currentRewardModeRef.current = currentRewardMode;
  }, [currentRewardMode]);

  useEffect(() => {
    wallPlacementPreviewRef.current = wallPlacementPreview;
  }, [wallPlacementPreview]);

  useEffect(() => {
    let lastTime = Date.now();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      let nextMatch = tickMatch(matchRef.current, deltaSeconds);
      let nextHero = heroRef.current;
      let nextDoorEncounters = doorEncountersRef.current;
      let nextCorePressure = corePressureRef.current;
      let nextCoreDefense = coreDefenseRef.current;
      let nextProjectiles = projectilesRef.current;
      let nextSpecialWeapons = specialWeaponsRef.current;
      let nextWallSystem = wallSystemRef.current;
      let nextHearts = tickHearts(heartsRef.current, deltaSeconds);
      let nextBattleResult = battleResultRef.current;

      if (nextMatch.status === MATCH_STATUS.RUNNING) {
        nextWallSystem = tickWallSystem(nextWallSystem, deltaSeconds);
        const specialWeaponTick = tickSpecialWeaponDrops(nextSpecialWeapons, deltaSeconds, {
          elapsedSeconds: nextMatch.elapsedSeconds,
          hero: nextHero
        });
        nextSpecialWeapons = specialWeaponTick.specialWeapons;
        nextHero = specialWeaponTick.hero;
        const combatTick = tickHeroCombat(nextHero, controlsRef.current, deltaSeconds, {
          walls: nextWallSystem.activeWalls
        });
        nextHero = combatTick.hero;
        nextDoorEncounters = tickDoorEncounters(
          nextDoorEncounters,
          nextHero.position,
          deltaSeconds,
          {
            elapsedSeconds: nextMatch.elapsedSeconds
          }
        );
        const corePressureTick = tickCorePressure(nextCorePressure, deltaSeconds, {
          elapsedSeconds: nextMatch.elapsedSeconds
        });
        nextCorePressure = corePressureTick.corePressure;
        if (corePressureTick.spawnedEnemies.length > 0) {
          nextDoorEncounters = setDoorEncounterEnemies(nextDoorEncounters, [
            ...nextDoorEncounters.spawnedEnemies,
            ...corePressureTick.spawnedEnemies
          ]);
        }

        if (combatTick.projectileSpawns.length > 0) {
          nextProjectiles = addProjectileSpawns(nextProjectiles, combatTick.projectileSpawns);
        }

        const projectileTick = tickProjectiles(nextProjectiles, deltaSeconds, {
          enemies: nextDoorEncounters.spawnedEnemies,
          walls: nextWallSystem.activeWalls
        });
        nextProjectiles = projectileTick.projectileState;
        nextDoorEncounters = setDoorEncounterEnemies(nextDoorEncounters, projectileTick.enemies);
        nextWallSystem = applyWallDamageEvents(nextWallSystem, projectileTick.wallDamageEvents);
        if (projectileTick.enemyKills > 0) {
          nextMatch = recordEnemyKills(nextMatch, projectileTick.enemyKills);
        }
        if (projectileTick.enemyCoreDamage > 0) {
          nextMatch = damageCore(nextMatch, CORE_IDS.ENEMY, projectileTick.enemyCoreDamage);
        }

        const coreDefenseTick = tickCoreDefense(
          nextCoreDefense,
          nextMatch,
          nextHero,
          deltaSeconds,
          {
            walls: nextWallSystem.activeWalls
          }
        );
        nextCoreDefense = coreDefenseTick.coreDefense;
        if (coreDefenseTick.spawnedEnemies.length > 0) {
          nextDoorEncounters = setDoorEncounterEnemies(nextDoorEncounters, [
            ...nextDoorEncounters.spawnedEnemies,
            ...coreDefenseTick.spawnedEnemies
          ]);
        }
        if (coreDefenseTick.heroDamage > 0) {
          nextHero = damageHero(nextHero, coreDefenseTick.heroDamage);
        }

        const enemyTick = tickEnemyBehavior(
          nextDoorEncounters.spawnedEnemies,
          {
            heroPosition: nextHero.position,
            playerCorePosition: PLAYER_CORE_ATTACK_POSITION,
            walls: nextWallSystem.activeWalls
          },
          deltaSeconds
        );
        nextDoorEncounters = setDoorEncounterEnemies(nextDoorEncounters, enemyTick.enemies);
        nextWallSystem = applyWallDamageEvents(nextWallSystem, enemyTick.wallDamageEvents);

        if (enemyTick.heroDamage > 0) {
          nextHero = damageHero(nextHero, enemyTick.heroDamage);
        }
        if (enemyTick.playerCoreDamage > 0) {
          nextMatch = damageCore(nextMatch, CORE_IDS.PLAYER, enemyTick.playerCoreDamage);
        }
      }

      if (
        nextMatch.status === MATCH_STATUS.ENDED &&
        matchRef.current.status !== MATCH_STATUS.ENDED &&
        !nextBattleResult
      ) {
        nextBattleResult = createBattleResult(nextMatch, {
          rewardMode: currentRewardModeRef.current
        });
      }

      if (nextMatch !== matchRef.current) {
        setMatch(nextMatch);
      }
      if (nextHero !== heroRef.current) {
        setHero(nextHero);
      }
      if (nextDoorEncounters !== doorEncountersRef.current) {
        setDoorEncounters(nextDoorEncounters);
      }
      if (nextCorePressure !== corePressureRef.current) {
        setCorePressure(nextCorePressure);
      }
      if (nextCoreDefense !== coreDefenseRef.current) {
        setCoreDefense(nextCoreDefense);
      }
      if (nextProjectiles !== projectilesRef.current) {
        setProjectiles(nextProjectiles);
      }
      if (nextSpecialWeapons !== specialWeaponsRef.current) {
        setSpecialWeapons(nextSpecialWeapons);
      }
      if (nextWallSystem !== wallSystemRef.current) {
        setWallSystem(nextWallSystem);
      }
      if (nextHearts !== heartsRef.current) {
        setHearts(nextHearts);
      }
      if (nextBattleResult !== battleResultRef.current) {
        setBattleResult(nextBattleResult);
      }
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, []);

  const resetControls = useCallback(() => {
    controlsRef.current = { ...EMPTY_CONTROLS };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "inactive" || nextAppState === "background") {
        resetControls();
        setMatch((current) => pauseForAppInterruption(current));
      }
    });

    return () => subscription.remove();
  }, [resetControls]);

  const setJoystickVector = useCallback((vector) => {
    controlsRef.current = {
      ...controlsRef.current,
      moveX: vector.x,
      moveY: vector.y
    };
  }, []);

  const setFiring = useCallback((isFiring) => {
    controlsRef.current = {
      ...controlsRef.current,
      isFiring
    };
  }, []);

  const setAimVector = useCallback((vector) => {
    controlsRef.current = {
      ...controlsRef.current,
      aimX: vector.x,
      aimY: vector.y
    };
  }, []);

  const handleFireHold = useCallback(
    (isFiring) => {
      if (isFiring) {
        const currentStatus = matchRef.current.status;
        if (currentStatus === MATCH_STATUS.READY || currentStatus === MATCH_STATUS.ENDED) {
          const freshWallSystem = createWallSystemState();
          const freshCoreDefense = createCoreDefenseState();
          const freshSpecialWeapons = createSpecialWeaponDropState();
          const heartUse = consumeHeartForQuickRound(heartsRef.current);
          setHero(createHeroCombatState());
          setDoorEncounters(createDoorEncounterState());
          setCorePressure(createCorePressureState());
          coreDefenseRef.current = freshCoreDefense;
          setCoreDefense(freshCoreDefense);
          setProjectiles(createProjectileState());
          specialWeaponsRef.current = freshSpecialWeapons;
          setSpecialWeapons(freshSpecialWeapons);
          wallSystemRef.current = freshWallSystem;
          setWallSystem(freshWallSystem);
          heartsRef.current = heartUse.hearts;
          setHearts(heartUse.hearts);
          currentRewardModeRef.current = heartUse.rewardMode;
          setCurrentRewardMode(heartUse.rewardMode);
          battleResultRef.current = null;
          setBattleResult(null);
          setWallPlacementPreview(null);
          resetControls();
          setMatch((current) => startMatch(current));
        } else if (currentStatus === MATCH_STATUS.PAUSED) {
          setMatch((current) => togglePause(current));
        }
      }

      setFiring(isFiring);
    },
    [resetControls, setFiring]
  );

  const handleReloadPress = useCallback(() => {
    if (matchRef.current.status !== MATCH_STATUS.RUNNING) {
      return;
    }

    setHero((current) => {
      const nextHero = startReload(current);
      heroRef.current = nextHero;
      return nextHero;
    });
  }, []);

  const handleWallToolSelect = useCallback((toolType) => {
    setWallSystem((current) => selectWallTool(current, toolType));
    setWallPlacementPreview(null);
  }, []);

  const getWallPlacementContext = useCallback(() => ({
    heroPosition: heroRef.current.position,
    enemies: doorEncountersRef.current.spawnedEnemies
  }), []);

  const screenPointToWorldPoint = useCallback(
    (point) => {
      const camera = getImageBattlefieldCamera(
        heroRef.current.position,
        { width, height },
        WORLD_BOUNDS
      );
      const worldPoint = {
        x: ((point.pageX + camera.offsetX) / camera.layerWidth) * WORLD_BOUNDS.width,
        y: ((point.pageY + camera.offsetY) / camera.layerHeight) * WORLD_BOUNDS.height
      };
      return worldPoint;
    },
    [height, width]
  );

  const handleWallPlacementPreview = useCallback(
    (point) => {
      if (matchRef.current.status !== MATCH_STATUS.RUNNING || !wallSystemRef.current.selectedTool) {
        setWallPlacementPreview(null);
        return;
      }

      const worldPoint = screenPointToWorldPoint(point);
      const preview = getFreePlacementPreview(
        wallSystemRef.current,
        worldPoint,
        getWallPlacementContext()
      );
      setWallPlacementPreview(preview);
    },
    [getWallPlacementContext, screenPointToWorldPoint]
  );

  const handleWallPlacementConfirm = useCallback(() => {
    const preview = wallPlacementPreviewRef.current;
    if (!preview || matchRef.current.status !== MATCH_STATUS.RUNNING) {
      setWallPlacementPreview(null);
      return;
    }

      setWallSystem((current) => {
        const placed = placeSelectedWallTool(current, preview.position, getWallPlacementContext());
        return placed.wallSystem;
      });
      setWallPlacementPreview(null);
    }, [getWallPlacementContext]);

  const handleWallPlacementCancel = useCallback(() => {
    setWallPlacementPreview(null);
  }, []);

  return (
    <View style={styles.safeArea}>
      <StatusBar hidden />
      <View style={styles.screen}>
        {!isLandscape ? (
          <View style={styles.rotatePanel}>
            <Text style={styles.rotateTitle}>Rotate Phone</Text>
            <Text style={styles.rotateText}>Sahib AI quick rounds are landscape-first.</Text>
          </View>
        ) : (
          <View style={styles.matchShell}>
            <View
              style={styles.battlefield}
            >
              <View style={styles.worldBackdrop} />
              <ImageBattlefield
                doorEncounters={doorEncounters}
                coreDefense={coreDefense}
                hero={hero}
                match={match}
                projectiles={[...(projectiles.trails ?? []), ...projectiles.active]}
                specialWeapons={specialWeapons}
                wallPlacementPreview={wallPlacementPreview}
                wallSystem={wallSystem}
              />
              <CombatTouchControls
                onAim={setAimVector}
                onFireHoldChange={handleFireHold}
                onCancelWallPlacement={handleWallPlacementCancel}
                onConfirmWallPlacement={handleWallPlacementConfirm}
                onMove={setJoystickVector}
                onPreviewWallAtScreenPoint={handleWallPlacementPreview}
                onSelectWallTool={handleWallToolSelect}
                selectedWallTool={wallSystem.selectedTool}
                hero={hero}
                onReload={handleReloadPress}
                wallCharges={wallSystem.charges}
              />
              {battleResult && (
                <ResultOverlay battleResult={battleResult} hearts={hearts} />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function ResultOverlay({ battleResult, hearts }) {
  return (
    <View pointerEvents="none" style={styles.resultOverlay}>
      <Text style={styles.resultTitle}>{battleResult.outcome.toUpperCase()}</Text>
      <Text style={styles.resultStat}>Coins {battleResult.baseCoins}</Text>
      <Text style={styles.resultSubtle}>
        Hearts {hearts.hearts}/{hearts.maxHearts}
      </Text>
    </View>
  );
}

function CombatTouchControls({
  hero,
  onAim,
  onCancelWallPlacement,
  onConfirmWallPlacement,
  onFireHoldChange,
  onMove,
  onPreviewWallAtScreenPoint,
  onReload,
  onSelectWallTool,
  selectedWallTool,
  wallCharges
}) {
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [aimOffset, setAimOffset] = useState({ x: 0, y: 0 });
  const [isFirePressed, setIsFirePressed] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const joystickVectorRef = useRef({ x: 0, y: 0 });
  const aimVectorRef = useRef({ x: 0, y: 0 });
  const activeJoystickTouchIdRef = useRef(null);
  const activeFireTouchIdsRef = useRef(new Set());
  const activePlacementTouchIdRef = useRef(null);
  const isFirePressedRef = useRef(false);

  const joystickLayout = getJoystickLayout(layout);
  const fireLayout = getFireLayout(layout);
  const reloadLayout = getReloadLayout(fireLayout);
  const ammoPanelLayout = getAmmoPanelLayout(layout);
  const wallToolLayouts = getWallToolLayouts(layout);
  const magazineAmmo = Math.max(0, Math.min(RIFLE.magazineSize, hero?.magazineAmmo ?? RIFLE.magazineSize));
  const ammoText = `${magazineAmmo}/${RIFLE.magazineSize}`;
  const reloadProgress =
    hero?.isReloading
      ? 1 - Math.max(0, hero.reloadRemainingSeconds ?? 0) / RIFLE.reloadSeconds
      : 0;

  const applyJoystickPoint = useCallback(
    (point) => {
      if (!layout.width || !layout.height || !isPointInsideJoystickControl(point, joystickLayout)) {
        return;
      }

      const input = calculateJoystickInput(point, joystickLayout, {
        knobSize: JOYSTICK_KNOB_SIZE
      });
      const vector = isNeutralVector(input.vector)
        ? input.vector
        : smoothJoystickVector(joystickVectorRef.current, input.vector);
      const radius = getJoystickRadius(joystickLayout, JOYSTICK_KNOB_SIZE);

      joystickVectorRef.current = vector;
      setKnobOffset({
        x: vector.x * radius,
        y: vector.y * radius
      });
      onMove(vector);
    },
    [joystickLayout, layout.height, layout.width, onMove]
  );

  const applyFirePoint = useCallback(
    (point) => {
      if (!layout.width || !layout.height) {
        return;
      }

      const input = calculateFireAimInput(point, fireLayout);
      aimVectorRef.current = input.vector;
      setAimOffset(input.knobOffset);
      onAim(input.vector);
    },
    [fireLayout, layout.height, layout.width, onAim]
  );

  const releaseJoystick = useCallback(() => {
    activeJoystickTouchIdRef.current = null;
    joystickVectorRef.current = { x: 0, y: 0 };
    setKnobOffset({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }, [onMove]);

  const setFirePressed = useCallback(
    (pressed) => {
      if (isFirePressedRef.current === pressed) {
        return;
      }

      isFirePressedRef.current = pressed;
      setIsFirePressed(pressed);
      onFireHoldChange(pressed);
    },
    [onFireHoldChange]
  );

  const handleTouchStart = useCallback(
    (event) => {
      for (const point of getChangedTouchPoints(event)) {
        const wallToolHit = getWallToolHit(point, wallToolLayouts);
        if (wallToolHit) {
          onSelectWallTool(wallToolHit.toolType);
          continue;
        }

        if (isPointInsideCircleControl(point, reloadLayout, { radiusMultiplier: 1.15 })) {
          onReload();
          continue;
        }

        if (
          selectedWallTool &&
          activePlacementTouchIdRef.current === null &&
          !isPointInsideCircleControl(point, fireLayout, { radiusMultiplier: 1.35 }) &&
          !isPointInsideCircleControl(point, reloadLayout, { radiusMultiplier: 1.15 }) &&
          !isPointInsideJoystickControl(point, joystickLayout)
        ) {
          activePlacementTouchIdRef.current = point.identifier;
          onPreviewWallAtScreenPoint(point);
          continue;
        }

        if (isPointInsideCircleControl(point, fireLayout, { radiusMultiplier: 1.35 })) {
          activeFireTouchIdsRef.current.add(point.identifier);
          applyFirePoint(point);
          continue;
        }

        if (
          activeJoystickTouchIdRef.current === null &&
          isPointInsideJoystickControl(point, joystickLayout)
        ) {
          activeJoystickTouchIdRef.current = point.identifier;
          applyJoystickPoint(point);
        }
      }

      if (activeFireTouchIdsRef.current.size > 0) {
        setFirePressed(true);
      }
    },
    [
      applyFirePoint,
      applyJoystickPoint,
      fireLayout,
      joystickLayout,
      onReload,
      onPreviewWallAtScreenPoint,
      onSelectWallTool,
      reloadLayout,
      selectedWallTool,
      setFirePressed,
      wallToolLayouts
    ]
  );

  const handleTouchMove = useCallback(
    (event) => {
      const joystickPoint = getTouchPointByIdentifier(
        event,
        activeJoystickTouchIdRef.current
      );

      if (joystickPoint) {
        applyJoystickPoint(joystickPoint);
      }

      const placementPoint = getTouchPointByIdentifier(
        event,
        activePlacementTouchIdRef.current
      );

      if (placementPoint) {
        onPreviewWallAtScreenPoint(placementPoint);
      }

      for (const point of getChangedTouchPoints(event)) {
        if (activeFireTouchIdsRef.current.has(point.identifier)) {
          applyFirePoint(point);
        }
      }
    },
    [applyFirePoint, applyJoystickPoint, onPreviewWallAtScreenPoint]
  );

  const handleTouchEnd = useCallback(
    (event) => {
      let joystickEnded = false;
      let placementEnded = false;
      for (const point of getChangedTouchPoints(event)) {
        if (point.identifier === activeJoystickTouchIdRef.current) {
          joystickEnded = true;
        }
        if (point.identifier === activePlacementTouchIdRef.current) {
          placementEnded = true;
        }
        activeFireTouchIdsRef.current.delete(point.identifier);
      }

      if (joystickEnded) {
        releaseJoystick();
      }
      if (placementEnded) {
        activePlacementTouchIdRef.current = null;
        onConfirmWallPlacement();
      }
      if (activeFireTouchIdsRef.current.size === 0) {
        aimVectorRef.current = { x: 0, y: 0 };
        setAimOffset({ x: 0, y: 0 });
        onAim({ x: 0, y: 0 });
        setFirePressed(false);
      }
    },
    [onAim, onConfirmWallPlacement, releaseJoystick, setFirePressed]
  );

  const handleTouchCancel = useCallback(
    (event) => {
      let joystickCancelled = false;
      let placementCancelled = false;
      for (const point of getChangedTouchPoints(event)) {
        if (point.identifier === activeJoystickTouchIdRef.current) {
          joystickCancelled = true;
        }
        if (point.identifier === activePlacementTouchIdRef.current) {
          placementCancelled = true;
        }
        activeFireTouchIdsRef.current.delete(point.identifier);
      }

      if (joystickCancelled) {
        releaseJoystick();
      }
      if (placementCancelled) {
        activePlacementTouchIdRef.current = null;
        onCancelWallPlacement();
      }
      if (activeFireTouchIdsRef.current.size === 0) {
        aimVectorRef.current = { x: 0, y: 0 };
        setAimOffset({ x: 0, y: 0 });
        onAim({ x: 0, y: 0 });
        setFirePressed(false);
      }
    },
    [onAim, onCancelWallPlacement, releaseJoystick, setFirePressed]
  );

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
      }}
      onTouchCancel={handleTouchCancel}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      style={styles.controlLayer}
    >
      <View
        accessibilityLabel="M416 ammo"
        pointerEvents="none"
        style={[
          styles.ammoPanel,
          {
            left: ammoPanelLayout.x,
            top: ammoPanelLayout.y
          }
        ]}
      >
        <View style={styles.gunIconBox}>
          <View style={styles.gunIconBarrel} />
          <View style={styles.gunIconBody} />
          <View style={styles.gunIconGrip} />
        </View>
        <View style={styles.ammoTextGroup}>
          <Text style={styles.weaponLabel}>M416</Text>
          <Text style={styles.ammoText}>{ammoText}</Text>
        </View>
      </View>
      <View
        accessibilityLabel="Reload"
        accessibilityRole="button"
        pointerEvents="none"
        style={[
          styles.reloadButton,
          hero?.isReloading && styles.reloadButtonActive,
          {
            left: reloadLayout.x,
            top: reloadLayout.y
          }
        ]}
      >
        <Text style={styles.reloadLabel}>R</Text>
        {hero?.isReloading && (
          <View
            style={[
              styles.reloadProgress,
              {
                width: `${Math.round(Math.max(0, Math.min(1, reloadProgress)) * 100)}%`
              }
            ]}
          />
        )}
      </View>
      <View
        accessibilityLabel="Movement joystick"
        accessibilityRole="adjustable"
        pointerEvents="none"
        style={[
          styles.joystickBase,
          {
            left: joystickLayout.x,
            top: joystickLayout.y
          }
        ]}
      >
        <View
          style={[
            styles.joystickKnob,
            {
              transform: [{ translateX: knobOffset.x }, { translateY: knobOffset.y }]
            }
          ]}
        />
      </View>
      <View
        accessibilityLabel="Fire"
        accessibilityRole="button"
        pointerEvents="none"
        style={[
          styles.actionButton,
          styles.primaryButton,
          isFirePressed && styles.pressedButton,
          {
            left: fireLayout.x,
            top: fireLayout.y
          }
        ]}
      >
        <View
          style={[
            styles.fireReticleOuter,
            {
              transform: [{ translateX: aimOffset.x }, { translateY: aimOffset.y }]
            }
          ]}
        >
          <View style={styles.fireReticleInner} />
        </View>
      </View>
      {wallToolLayouts.map((tool) => (
        <View
          accessibilityLabel={WALL_TOOL_CONFIGS[tool.toolType].label}
          accessibilityRole="button"
          key={tool.toolType}
          pointerEvents="none"
          style={[
            styles.wallToolButton,
            selectedWallTool === tool.toolType && styles.wallToolButtonSelected,
            wallCharges <= 0 && styles.wallToolButtonEmpty,
            {
              left: tool.x,
              top: tool.y
            }
          ]}
        >
          <Text style={styles.wallToolLabel}>{WALL_TOOL_CONFIGS[tool.toolType].shortLabel}</Text>
          <Text style={styles.wallToolCharge}>{wallCharges}</Text>
        </View>
      ))}
    </View>
  );
}

function calculateFireAimInput(point, layout) {
  const radius = Math.max(1, Math.min(layout.width, layout.height) * 0.32);
  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;
  const rawX = point.pageX - centerX;
  const rawY = point.pageY - centerY;
  const distance = Math.sqrt(rawX * rawX + rawY * rawY);

  if (distance < 8) {
    return {
      vector: { x: 0, y: 0 },
      knobOffset: { x: 0, y: 0 }
    };
  }

  const clampedDistance = Math.min(distance, radius);
  const normalX = rawX / distance;
  const normalY = rawY / distance;

  return {
    vector: {
      x: normalX,
      y: normalY
    },
    knobOffset: {
      x: normalX * clampedDistance,
      y: normalY * clampedDistance
    }
  };
}

function isNeutralVector(vector) {
  return vector.x === 0 && vector.y === 0;
}

function getJoystickLayout(layout) {
  return {
    x: 22,
    y: Math.max(0, layout.height - 22 - JOYSTICK_SIZE),
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE
  };
}

function getFireLayout(layout) {
  const size = 96;
  return {
    x: Math.max(0, layout.width - 28 - size),
    y: Math.max(0, layout.height - 28 - size),
    width: size,
    height: size
  };
}

function getReloadLayout(fireLayout) {
  const size = 42;
  return {
    x: Math.max(0, fireLayout.x - 48),
    y: Math.max(0, fireLayout.y + 6),
    width: size,
    height: size
  };
}

function getAmmoPanelLayout(layout) {
  return {
    x: Math.max(0, layout.width - 150),
    y: 18,
    width: 122,
    height: 58
  };
}

function getWallToolLayouts(layout) {
  const size = 52;
  const gap = 10;
  const tools = [
    WALL_TOOL_TYPES.BLOCK
  ];
  const fireLayout = getFireLayout(layout);
  const totalHeight = tools.length * size + (tools.length - 1) * gap;
  const y = Math.max(18, fireLayout.y - totalHeight - 18);
  const x = Math.max(0, layout.width - 28 - size);

  return tools.map((toolType, index) => ({
    toolType,
    x,
    y: y + index * (size + gap),
    width: size,
    height: size
  }));
}

function getWallToolHit(point, toolLayouts) {
  return toolLayouts.find((layout) => isPointInsideRectControl(point, layout)) ?? null;
}

function isPointInsideRectControl(point, layout) {
  return (
    point.pageX >= layout.x &&
    point.pageX <= layout.x + layout.width &&
    point.pageY >= layout.y &&
    point.pageY <= layout.y + layout.height
  );
}

function getChangedTouchPoints(event) {
  const touches = event?.nativeEvent?.changedTouches;
  if (Array.isArray(touches) && touches.length > 0) {
    return touches.map(normalizeTouchPoint).filter(Boolean);
  }

  const point = normalizeTouchPoint(event?.nativeEvent);
  return point ? [point] : [];
}

function getTouchPointByIdentifier(event, identifier) {
  if (identifier === null || typeof identifier === "undefined") {
    return null;
  }

  const touches = event?.nativeEvent?.touches;
  if (!Array.isArray(touches)) {
    return null;
  }

  const touch = touches.find((candidate) => (candidate.identifier ?? 0) === identifier);
  return normalizeTouchPoint(touch);
}

function normalizeTouchPoint(touch) {
  if (!touch) {
    return null;
  }

  const x = typeof touch.locationX === "number" ? touch.locationX : touch.pageX;
  const y = typeof touch.locationY === "number" ? touch.locationY : touch.pageY;
  if (typeof x !== "number" || typeof y !== "number") {
    return null;
  }

  return {
    identifier: touch.identifier ?? 0,
    pageX: x,
    pageY: y
  };
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#171019"
  },
  screen: {
    flex: 1,
    backgroundColor: "#171019"
  },
  matchShell: {
    flex: 1
  },
  battlefield: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#2a182c"
  },
  worldBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#24162b"
  },
  lanePath: {
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(246, 234, 216, 0.12)",
    backgroundColor: "#7a5a4b"
  },
  coreAreaPath: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(124, 212, 255, 0.18)",
    backgroundColor: "#6f5147"
  },
  sideRoutePath: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(246, 234, 216, 0.14)",
    backgroundColor: "#725347"
  },
  centerZone: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(244, 211, 111, 0.32)",
    backgroundColor: "#8a6654"
  },
  intersectionZone: {
    position: "absolute",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(124, 212, 255, 0.28)",
    backgroundColor: "#83614f"
  },
  mapBlocker: {
    position: "absolute",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(246, 234, 216, 0.14)",
    backgroundColor: "#34303a"
  },
  doorSlot: {
    position: "absolute",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 139, 130, 0.72)",
    backgroundColor: "#41202a"
  },
  centerDoorSlot: {
    position: "absolute",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(244, 211, 111, 0.72)",
    backgroundColor: "#3b3040"
  },
  mapLabel: {
    position: "absolute",
    width: 60,
    textAlign: "center",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(13, 10, 16, 0.72)",
    color: "#f6ead8",
    fontSize: 9,
    fontWeight: "900",
    paddingVertical: 3
  },
  laneLabel: {
    color: "#eadcc8"
  },
  sideRouteLabel: {
    color: "#eadcc8"
  },
  centerLabel: {
    color: "#f4d36f"
  },
  intersectionLabel: {
    color: "#bfeaff"
  },
  coreMarker: {
    position: "absolute",
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 48,
    borderWidth: 4,
    backgroundColor: "#171a20"
  },
  coreMarkerText: {
    fontSize: 15,
    fontWeight: "900"
  },
  markerHpTrack: {
    width: 66,
    height: 7,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#302635",
    marginTop: 6
  },
  markerHpFill: {
    height: "100%",
    borderRadius: 4
  },
  markerHpText: {
    color: "#f6ead8",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3
  },
  heroMarker: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#f4d36f",
    backgroundColor: "#243247"
  },
  heroInRange: {
    borderColor: "#7cd4ff"
  },
  heroDowned: {
    borderColor: "#ff8b82",
    backgroundColor: "#3b1b22"
  },
  heroMarkerText: {
    color: "#f6ead8",
    fontSize: 13,
    fontWeight: "900"
  },
  controlLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8
  },
  ammoPanel: {
    position: "absolute",
    width: 122,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(124, 212, 255, 0.62)",
    backgroundColor: "rgba(15, 20, 28, 0.82)",
    paddingHorizontal: 8
  },
  gunIconBox: {
    width: 48,
    height: 34,
    justifyContent: "center"
  },
  gunIconBody: {
    width: 30,
    height: 8,
    borderRadius: 3,
    backgroundColor: "#d6e9ef"
  },
  gunIconBarrel: {
    position: "absolute",
    left: 28,
    top: 13,
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9db8c2"
  },
  gunIconGrip: {
    position: "absolute",
    left: 13,
    top: 20,
    width: 8,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#8097a3",
    transform: [{ rotate: "-14deg" }]
  },
  ammoTextGroup: {
    flex: 1,
    alignItems: "flex-end"
  },
  weaponLabel: {
    color: "#bfeaff",
    fontSize: 11,
    fontWeight: "900"
  },
  ammoText: {
    color: "#f6ead8",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 1
  },
  resultOverlay: {
    position: "absolute",
    left: "50%",
    top: 18,
    zIndex: 9,
    minWidth: 180,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(244, 211, 111, 0.78)",
    backgroundColor: "rgba(14, 10, 18, 0.84)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    transform: [{ translateX: -90 }]
  },
  resultTitle: {
    color: "#f4d36f",
    fontSize: 18,
    fontWeight: "900"
  },
  resultStat: {
    color: "#f6ead8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  },
  resultSubtle: {
    color: "#bfeaff",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3
  },
  joystickBase: {
    position: "absolute",
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: JOYSTICK_SIZE / 2,
    borderWidth: 3,
    borderColor: "rgba(124, 212, 255, 0.82)",
    backgroundColor: "rgba(14, 12, 18, 0.64)"
  },
  joystickKnob: {
    width: JOYSTICK_KNOB_SIZE,
    height: JOYSTICK_KNOB_SIZE,
    borderRadius: JOYSTICK_KNOB_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(246, 234, 216, 0.32)",
    backgroundColor: "#4ea9d8"
  },
  fireControl: {
    position: "absolute",
    right: 28,
    bottom: 28,
    zIndex: 8
  },
  actionButton: {
    position: "absolute",
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(245, 234, 216, 0.18)",
    backgroundColor: "rgba(44, 38, 50, 0.86)"
  },
  primaryButton: {
    borderColor: "#4ea9d8",
    backgroundColor: "rgba(22, 50, 68, 0.88)"
  },
  pressedButton: {
    opacity: 0.72
  },
  reloadButton: {
    position: "absolute",
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "rgba(246, 234, 216, 0.68)",
    backgroundColor: "rgba(23, 18, 24, 0.86)"
  },
  reloadButtonActive: {
    borderColor: "#f4d36f"
  },
  reloadLabel: {
    zIndex: 1,
    color: "#f6ead8",
    fontSize: 16,
    fontWeight: "900"
  },
  reloadProgress: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 5,
    backgroundColor: "#f4d36f"
  },
  fireReticleOuter: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 4,
    borderColor: "#bfeaff"
  },
  fireReticleInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#bfeaff"
  },
  wallToolButton: {
    position: "absolute",
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(244, 211, 111, 0.72)",
    backgroundColor: "rgba(24, 18, 25, 0.82)"
  },
  wallToolButtonSelected: {
    borderColor: "#7cd4ff",
    backgroundColor: "rgba(41, 61, 76, 0.9)"
  },
  wallToolButtonEmpty: {
    opacity: 0.48
  },
  wallToolLabel: {
    color: "#f6ead8",
    fontSize: 18,
    fontWeight: "900"
  },
  wallToolCharge: {
    position: "absolute",
    right: 6,
    bottom: 3,
    color: "#f4d36f",
    fontSize: 10,
    fontWeight: "900"
  },
  rotatePanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  rotateTitle: {
    color: "#f4d36f",
    fontSize: 30,
    fontWeight: "900"
  },
  rotateText: {
    color: "#eadcc8",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center"
  }
});
