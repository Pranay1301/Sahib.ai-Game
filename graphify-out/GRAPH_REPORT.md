# Graph Report - Sahib.ai-Game-main  (2026-05-29)

## Corpus Check
- 115 files · ~87,668 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1606 nodes · 3010 edges · 80 communities (77 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96b3cc17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 80|Community 80]]

## God Nodes (most connected - your core abstractions)
1. `getBaseCopy()` - 25 edges
2. `normalizeBaseLanguage()` - 24 edges
3. `BUILDING_STATES` - 19 edges
4. `Sahib AI V1 New Chat Handoff` - 19 edges
5. `distanceBetween()` - 18 edges
6. `isWalkableBody()` - 18 edges
7. `Sahib AI V1 Implementation Status` - 18 edges
8. `buildMap()` - 17 edges
9. `createBaseHomeViewModel()` - 17 edges
10. `setPos()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `farHero()` --calls--> `createHeroCombatState()`  [EXTRACTED]
  tests/specialWeapons.test.mjs → src/game/heroCombat.js
- `createRunningMatch()` --calls--> `createMatchState()`  [EXTRACTED]
  tests/coreDefense.test.mjs → src/game/matchState.js
- `farHero()` --calls--> `createHeroCombatState()`  [EXTRACTED]
  tests/coreDefense.test.mjs → src/game/heroCombat.js
- `claimCoins()` --calls--> `claimBattleResultReward()`  [EXTRACTED]
  tests/basePhase15Qa.test.mjs → src/base/baseRewardBridge.js
- `claimCoins()` --calls--> `createDefaultGameState()`  [EXTRACTED]
  tests/basePhase15Qa.test.mjs → src/base/baseBackend.js

## Communities (80 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (23): CENTER_ZONE, CORE_ACCESS_POINTS, ENEMY_CORE_POSITION, HERO_START_POSITION, isDoorBlockingWalkablePath(), isPointInCollisionBlocker(), isPointInEllipse(), isPointInRect() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (45): getCharacterModelDescriptors(), getCharacterModelYawRadians(), getEnemyModelAction(), getEnemyModelDescriptor(), getHeroModelAction(), getHeroModelDescriptor(), worldToViewportModelPoint(), CHARACTER_MODEL_ACTIONS (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (58): addMinutesToIsoTimestamp(), assertBackendSchemaHasNoForbiddenFields(), assertBattleResult(), assertIsoTimestamp(), assertRequiredString(), assertUserId(), BASE_BACKEND_SCHEMA, BASE_BACKEND_TABLES (+50 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (42): addPlacementToState(), addVectors(), applyWallDamageEvents(), clampWorldPoint(), createFreePlacementCandidate(), degreesToRadians(), distanceBetween(), doesSegmentHitWall() (+34 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (18): assertSupportedLearningTrack(), BASE_BUILDING_COPY_KEYS, BASE_COPY_KEYS, BASE_LANGUAGES, BASE_LEARNING_TRACK_COPY_KEYS, BASE_SKILL_TIER_KEYS, BASE_TRANSLATIONS, getSupportedBaseLanguages() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (35): clamp(), cross3(), degreesToRadians(), dot3(), FIXED_ISOMETRIC_CAMERA, getFixedFollowCamera(), getFullMapCameraPosition(), getFullMapCameraTarget() (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (41): Behavior, Behavior, Behavior, Behavior, Breaker Bot, Center fight zone enemy behavior, Chasing and following rules, Core pressure waves (+33 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (42): Camera, Rifle, And Door Readability Tuning, Character Collision And Enemy Damage Tuning, Core combat correction after Phase 8, Main base kingdom map handoff update, Phase 1, Phase 10, Phase 11, Phase 12 (+34 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (28): EXPECTED_ANIMATIONS, EXPECTED_ENEMY_OPTIMIZED_ANIMATIONS, formatMb(), printSummary(), readGlbJson(), summarizeGlb(), afterSize, assetsToOptimize (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (24): calculateJoystickInput(), clamp(), createNeutralInput(), getJoystickRadius(), isPointInsideCircleControl(), isPointInsideJoystickControl(), smoothJoystickVector(), CombatTouchControls() (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (30): App behavior, Center fight/drop zone, Core defense summary, Core loop, Core pressure waves, Door sequence randomizer implementation, Door sequence randomness, Door system (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (29): App Routing Rule, Asset Rules, code:text (App.js), code:text (docs/PHASE_PLAN.md), code:bash (graphify query "main base map architecture"), code:bash (graphify update .), code:bash (npm test), code:powershell (Remove-Item -LiteralPath ".expo-export-test" -Recurse -Force) (+21 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (27): bytearray, float, Image, ImageDraw, int, Path, create_alpha_mask(), create_frame() (+19 more)

### Community 13 - "Community 13"
Cohesion: 0.07
Nodes (26): code:powershell (npm run optimize:phase6-glb), code:text (assets/phase6/glb/hero.glb), code:text (Dead), code:text (src/assets/characterModelModules.js), code:powershell (npm test), code:powershell (Remove-Item -LiteralPath ".expo-export-test" -Recurse -Force), code:powershell (npx expo start -c), Completed Phase Status (+18 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (25): dependencies, expo, expo-asset, expo-gl, react, react-native, three, devDependencies (+17 more)

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (23): Baseline enemy count per 3-door intersection sequence, Camera and app behavior, Core defense, Definition of done for V1 quick-round work, Enemy roster and roles, External Three.js skills and references, First instructions for Codex, graphify (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (22): createLocalMatchId(), createMatchState(), damageCore(), endMatch(), finishByTimer(), formatTime(), getCorePercent(), getRemainingSeconds() (+14 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (22): Center zone wall rules, Codex implementation instruction, Confirmed starting values, Core V1 principle, Do not build in V1, Enemy behavior when blocked, Layer 1: Static collision, Layer 2: Simple enemy reaction (+14 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (34): addVectors(), advanceDynamicRoute(), clamp(), clearDynamicRoute(), compressPathCells(), decayDynamicPath(), enemyPathGridCache, findEnemyPath() (+26 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (25): clampDirectionIndex(), DIRECTION_ROWS, getDirectionIndexFromVector(), createDoorEnemySpawns(), createEnemy(), ENEMY_TARGETS, getDoorEnemyTypes(), getDoorSpawnSpread() (+17 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (20): clearFrame(), drawFrame(), OUT_DIR, OUT_FILE, palette, png, rect(), roundedRect() (+12 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (18): consumeHeartForQuickRound(), createHeartState(), ensureRefillTimer(), HEART_REWARD_MODES, tickHearts(), consumed, empty, refilled (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.06
Nodes (53): CORE_PRESSURE_ROUTE_POINTS_BY_LANE_ID, CORE_PRESSURE_WAVE_CONFIG_BY_PHASE, createCorePressureState(), createCorePressureWave(), getCorePressureWaveConfig(), getFacingVectorToPlayerCore(), tickCorePressure(), addDoorOpenEffects() (+45 more)

### Community 23 - "Community 23"
Cohesion: 0.10
Nodes (18): 25% HP, 50% HP, 75% HP, Core concept, Core defense doors, Core destruction, Core HP, Enemy Core attack (+10 more)

### Community 24 - "Community 24"
Cohesion: 0.10
Nodes (19): Branch Workflow, code:text (src/screens/MainBaseMapScreen.js), code:js (startQuickRound({), code:js ({), code:text (feature/main-map), code:powershell (npm test), code:text (We are continuing Sahib AI from this repo. I am building the), Codex Prompt For Main Map Teammate (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.12
Nodes (15): Avoid, Blockout-first rule, Center fight/drop zone, Core positions, Door placement, Door sequence, Intersection shape, Major intersections (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (14): Ammo logic, Death and respawn, Default weapon, Do not add in V1, Drop placement rules, Hero identity, Hero score impact, Movement and combat feel (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (14): Camera/reference angle, Center door placement, Center fight/drop zone, Center trigger, Core areas, Developer implementation checklist, Door randomization coding rule, Door system summary (+6 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (15): package, expo, android, assetBundlePatterns, extra, ios, name, orientation (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (12): Build philosophy, Center fight/drop zone included in V1, Definition of V1 success, Enemies, Explicitly excluded from V1, Gameplay, Hero, Included in V1 (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (12): Alien visual rules, Blockout-first visual rule, Breaker Bot visual, Buildings, Do not do, Doors and intersections, Enemy readability, Hero visual (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.07
Nodes (25): activeAfterProPurchase, battleResult, challengeStart, claimCoins(), completeLevelSix, completeLevelTwo, createBattleResult(), duplicate (+17 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (11): Development principle, Phase 1: Core playable loop, Phase 2: Intersections and doors, Phase 2B: Center fight/drop zone, Phase 3: Enemy behavior logic, Phase 4: Wall system, Phase 5: Core pressure and Core defense, Phase 6: Special timed weapon drop (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (12): __dirname, gridHeight, gridWidth, image, inputPath, isCellWalkable(), isSourcePixelWalkable(), map (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (10): Base Coin Output, BattleResult Contract, code:js (finalCoins = user.is_pro ? battleResult.baseCoins * 3 : batt), code:js ({), Core Principle, Do Not Build In Quick Round, Hearts And Access, Ownership Split (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.20
Nodes (18): assertTargetLevel(), BASE_ECONOMY_CONFIG, BASE_LEARNING_TRACK_DEFINITIONS, BASE_SKILL_CHALLENGE_RULES, BASE_SLOT_IDS, getFreeTimerMinutesForTargetLevel(), getLearningTrackDefinition(), getNextBuildingLevel() (+10 more)

### Community 36 - "Community 36"
Cohesion: 0.10
Nodes (18): ENEMY_STATS, damageHero(), HERO_RESPAWN_POSITION, addProjectileSpawns(), createProjectileState(), createWallSystemState(), aim, downed (+10 more)

### Community 37 - "Community 37"
Cohesion: 0.23
Nodes (12): CORE_IDS, MATCH_OUTCOMES, MATCH_STATUS, BASE_COIN_REWARDS, createBattleResult(), createBattleResultFromEndedMatch(), createLocalBattleResultId(), BATTLE_RESULT_FIELDS (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (8): Allowed Use Of External Three.js Skills, Authority Order, Camera, Controls, Map Visual Reference, Purpose, Runtime Rules, Three.js Mobile Rules

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (8): code:bash (npm install), code:bash (npm run android), code:bash (npx expo export --platform android --output-dir .expo-export), Current State, Important Docs, Notes For Contributors, Sahib AI Mobile, Setup

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (6): BattleResult Type, code:ts (type BattleResult = {), Final V1 Reward Rules, Latest Clean Rule, Ownership, Purpose

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (7): blendPixel(), drawGate(), gates, image, inputPath, outputPath, rootDir

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (7): Baseline enemy count table, Codex tasks, Done when, Goal, Latest confirmed rules, Match phases, Phase 7 — Time phases and enemy count scaling

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (6): Codex tasks, Done when, Goal, Latest confirmed enemy roles, Phase 6 — Enemy roster and basic behavior logic, Starting stats

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (5): Build philosophy, Global V1 constraints, How Codex should use this file, Purpose, Repo docs to reference

### Community 45 - "Community 45"
Cohesion: 0.12
Nodes (23): createHeroCombatState(), ENERGY_BURST_RIFLE, equipEnergyBurstRifle(), HERO_STATUS, RIFLE, WEAPON_IDS, areSpecialWeaponDropPointsWalkable(), collectNearbyPickup() (+15 more)

### Community 46 - "Community 46"
Cohesion: 0.15
Nodes (20): BASE_PRO_TOUCHPOINT_CONFIG, BASE_PRO_TOUCHPOINTS, createBenefitCard(), createComparisonRow(), createFirstUpgradeProConversion(), createMainProBenefitCards(), createMainProComparisonRows(), createMainProScreenViewModel() (+12 more)

### Community 47 - "Community 47"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 1 — Core quick-round shell

### Community 48 - "Community 48"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 11 — Timed special weapon drop

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 12 — Hearts, rewards, and result flow

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (4): Codex tasks, Done when, Goal, Phase 0 — Repo inspection and setup

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 10 — Enemy Core defense

### Community 52 - "Community 52"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed visual rules, Phase 13 — Visual/blockout upgrade pass

### Community 53 - "Community 53"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Phase 14 — Testing and tuning, Tune after testing

### Community 54 - "Community 54"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 2 — Hero movement and rifle combat

### Community 55 - "Community 55"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 3 — Hero respawn

### Community 56 - "Community 56"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 4 — Map blockout and intersections

### Community 57 - "Community 57"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 5 — Mechanical enemy doors and randomized intersection encounters

### Community 58 - "Community 58"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 5B — Center fight/drop zone

### Community 59 - "Community 59"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 8 — Core pressure waves

### Community 60 - "Community 60"
Cohesion: 0.40
Nodes (5): Codex tasks, Done when, Goal, Latest confirmed rules, Phase 9 — Wall system V1

### Community 64 - "Community 64"
Cohesion: 0.39
Nodes (6): BASE_BUILDING_SOURCE_IMAGES, BASE_VISUAL_REFERENCE_ASSETS, getBaseVisualReferenceAsset(), getBaseVisualSourcePath(), APP_ROOT, WORKSPACE_ROOT

### Community 65 - "Community 65"
Cohesion: 0.07
Nodes (37): BASE_BUILDING_DEFINITIONS, BASE_BUILDING_IDS, BUILDING_STATES, getBuildingDefinition(), BaseHomeScreen(), BuildingSlot(), styles, BASE_BUILDING_TAP_ACTIONS (+29 more)

### Community 66 - "Community 66"
Cohesion: 0.10
Nodes (33): assertActiveUpgrade(), assertBuildingRow(), assertIsoTimestamp(), assertRequiredString(), BASE_UPGRADE_TIMER_REASONS, clampNumber(), clampWholeNumber(), completeUpgradeTimer() (+25 more)

### Community 67 - "Community 67"
Cohesion: 0.53
Nodes (4): ENEMY_TYPES, ENEMY_READABILITY_ACCENTS, getEnemyReadabilityAccent(), accents

### Community 68 - "Community 68"
Cohesion: 0.12
Nodes (24): calculateFinalCoins(), getBaseCoinsForOutcome(), ARABIC_DIGITS, assertBattleResultForBase(), assertRequiredString(), BASE_REWARD_BRIDGE_REASONS, claimBattleResultReward(), createBattleRewardPreview() (+16 more)

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (10): getBaseCopy(), BASE_UPGRADE_CHALLENGE_REQUIREMENT, createBuildingUpgradeModalFromSlots(), createBuildingUpgradeModalViewModel(), createLevelSummary(), createTimerSummary(), formatBaseDurationMinutes(), normalizeWholeNumber() (+2 more)

### Community 70 - "Community 70"
Cohesion: 0.12
Nodes (28): BASE_HOME_SLOT_LAYOUT, BASE_HOME_TOTAL_VISUAL_STATES, clampWholeNumber(), createBaseHomeSlots(), createBaseHomeViewModel(), createSkillBadgeViewModel(), createSlotTapResult(), getBuildingLevel() (+20 more)

### Community 71 - "Community 71"
Cohesion: 0.12
Nodes (22): addCoreDefenseDoorSignals(), createCoreDefenseState(), createCoreDefenseWave(), decayCoreDefenseSignals(), ENEMY_CORE_DEFENSE_THRESHOLDS, ENEMY_CORE_DEFENSE_WAVE_TYPES, getCoreDefenseWaveTypes(), getEnemyCoreAttackDamage() (+14 more)

### Community 72 - "Community 72"
Cohesion: 0.09
Nodes (33): answerSkillChallengeQuestion(), applySkillChallengeResultToGameState(), arraysEqual(), assertSkillChallengeResult(), assertSkillChallengeSession(), assertValidChallenge(), BASE_SKILL_CHALLENGE_OUTCOMES, BASE_SKILL_CHALLENGE_PHASES (+25 more)

### Community 73 - "Community 73"
Cohesion: 0.15
Nodes (24): findAssetReference(), CORE_AREAS, MAP_BLOCKERS, addBaseRoomProxy(), addCrateProxy(), addDeskProxy(), addDynamic(), addHealthPackProxy() (+16 more)

### Community 74 - "Community 74"
Cohesion: 0.23
Nodes (15): advanceEnemyRoute(), getActiveRouteTarget(), getEnemyStats(), getEnemyTarget(), getNearestWall(), getWallTargetForEnemy(), tickEnemyBehavior(), distanceBetween() (+7 more)

### Community 75 - "Community 75"
Cohesion: 0.19
Nodes (8): getFlatAssetRefs(), getReferencedAssetPaths(), MAP_ART_WALLS, MAP_ASSET_LIBRARY, MAP_CHARACTER_STAGING, MAP_PROP_PLACEMENTS, MAP_TREE_CLUSTERS, cwd

### Community 76 - "Community 76"
Cohesion: 0.24
Nodes (11): attachRuntimeMapAssets(), attachSingleAsset(), attachTreeClusterAssets(), createFittedModel(), createModelLoadingManager(), createPlaceholderTextureLoader(), defaultTargetFor(), getTextureUriMap() (+3 more)

### Community 77 - "Community 77"
Cohesion: 0.25
Nodes (18): aimHero(), areSamePosition(), clamp(), fireEnergyBurst(), fireRifleBurst(), getActiveWeaponConfig(), getFireIntervalSeconds(), getRifleMuzzlePosition() (+10 more)

### Community 78 - "Community 78"
Cohesion: 0.32
Nodes (14): addArtWall(), addCharacterStage(), addDoor(), addEllipse(), addFloorPanelLines(), addRect(), addRuntimeAsset(), addRuntimeBaseSurfaceOverlays() (+6 more)

### Community 80 - "Community 80"
Cohesion: 0.33
Nodes (9): assertIsoTimestamp(), BASE_LOCAL_REMINDER_PERMISSION_STATUSES, BASE_LOCAL_REMINDER_SCOPE, BASE_LOCAL_REMINDER_TEMPLATES, createLocalReminderPermissionPrompt(), createLocalReminderSchedule(), shouldAskLocalReminderPermission(), prompt (+1 more)

## Knowledge Gaps
- **753 isolated node(s):** `name`, `slug`, `version`, `orientation`, `platforms` (+748 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `consumeHeartForQuickRound()` connect `Community 21` to `Community 9`, `Community 31`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `createHeartState()` connect `Community 21` to `Community 9`, `Community 31`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `tickHearts()` connect `Community 21` to `Community 9`, `Community 31`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _753 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11083743842364532 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05432692307692308 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0647887323943662 - nodes in this community are weakly interconnected._