import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { BASE_VISUAL_IMAGE_MODULES } from "../../assets/baseVisualModules.js";
import { createBaseHomeViewModel } from "../../base/baseHomeModel.js";
import { createBuildingTapResult } from "../../base/baseUnlocks.js";

export function BaseHomeScreen({
  viewModel = null,
  profile = null,
  gameState = null,
  buildings = null,
  selectedBuildingId = null,
  onBuildingPress = null,
  onLanguagePress = null,
  onProPress = null,
  onUpgradeConfirm = null,
  onUpgradeModalClose = null,
  onProUpsellPress = null,
  onSkillTrackPress = null,
  onQuickBattlePress = null
}) {
  const model = viewModel ?? createBaseHomeViewModel({
    profile: profile ?? {},
    gameState: gameState ?? {},
    buildings: buildings ?? [],
    selectedBuildingId
  });

  return React.createElement(
    View,
    { style: styles.root },
    React.createElement(View, { style: styles.skyGlow }),
    React.createElement(
      View,
      { style: styles.topBar },
      React.createElement(
        View,
        { style: styles.resourceGroup },
        React.createElement(ResourcePill, {
          label: model.hud.coinsLabel,
          value: model.hud.coins
        }),
        React.createElement(ResourcePill, {
          label: model.hud.heartsLabel,
          value: model.hud.isUnlimitedHearts
            ? model.hud.heartsLabel
            : `${model.hud.heartsRemaining}/${model.hud.heartsMax}`
        })
      ),
      React.createElement(
        Pressable,
        {
          accessibilityLabel: model.languageSwitch.label,
          accessibilityRole: "button",
          onPress: onLanguagePress,
          style: styles.languageButton
        },
        React.createElement(Text, { style: styles.languageText }, model.languageSwitch.label)
      ),
      React.createElement(
        Pressable,
        {
          accessibilityLabel: model.proBadge.label,
          accessibilityRole: "button",
          onPress: onProPress,
          style: [
            styles.proBadge,
            model.proBadge.isPro ? styles.proBadgeActive : styles.proBadgeFree
          ]
        },
        React.createElement(Text, { style: styles.proBadgeText }, model.proBadge.label)
      )
    ),
    React.createElement(
      View,
      { style: styles.baseCanvas },
      React.createElement(
        ImageBackground,
        {
          imageStyle: styles.baseCanvasImage,
          resizeMode: "cover",
          source: BASE_VISUAL_IMAGE_MODULES.emptyLandBackground,
          style: styles.baseCanvasBackground
        },
        React.createElement(View, { style: styles.baseCanvasTone }),
        React.createElement(View, { style: styles.outerWall }),
        model.slots.map((slot) =>
          React.createElement(BuildingSlot, {
            key: slot.slotId,
            onPress: onBuildingPress,
            slot
          })
        )
      )
    ),
    React.createElement(
      View,
      { style: styles.bottomBar },
      React.createElement(SkillTrackSelector, {
        onSelect: onSkillTrackPress,
        selector: model.skillTrackSelector
      }),
      React.createElement(
        View,
        { style: styles.skillBadge },
        React.createElement(
          View,
          { style: styles.skillBadgeHeader },
          React.createElement(Text, { style: styles.skillTierTitle }, model.skillBadge.tierTitle),
          model.skillBadge.proBadge
            ? React.createElement(
                View,
                { style: styles.skillProBadge },
                React.createElement(Text, { numberOfLines: 1, style: styles.skillProBadgeText }, model.skillBadge.proBadge.label)
              )
            : null
        ),
        React.createElement(Text, { style: styles.skillTierText }, model.skillBadge.tierLabel),
        React.createElement(Text, { numberOfLines: 1, style: styles.skillTrackText }, model.skillBadge.learningTrackLabel),
        React.createElement(
          Text,
          { style: styles.skillMetaText },
          `${model.skillBadge.challengesCompleted} ${model.skillBadge.challengesLabel}`
        ),
        React.createElement(
          Text,
          { style: styles.skillMetaText },
          `${model.skillBadge.kingdomProgressLabel}: ${model.skillBadge.kingdomProgress.current}/${model.skillBadge.kingdomProgress.total}`
        )
      ),
      React.createElement(
        Pressable,
        {
          accessibilityLabel: model.quickBattleAction.label,
          accessibilityRole: "button",
          onPress: onQuickBattlePress,
          style: styles.quickBattleButton
        },
        React.createElement(Text, { style: styles.quickBattleText }, model.quickBattleAction.label)
      )
    ),
    model.upgradeModal
      ? React.createElement(UpgradeModal, {
          modal: model.upgradeModal,
          onClose: onUpgradeModalClose,
          onConfirm: onUpgradeConfirm,
          onProPress: onProUpsellPress ?? onProPress
        })
      : null
  );
}

function SkillTrackSelector({ selector, onSelect }) {
  if (!selector) {
    return null;
  }

  return React.createElement(
    View,
    { style: styles.trackSelector },
    React.createElement(Text, { style: styles.trackSelectorTitle }, selector.title),
    React.createElement(
      View,
      { style: styles.trackOptionRow },
      selector.options.map((option) =>
        React.createElement(
          Pressable,
          {
            accessibilityLabel: option.label,
            accessibilityRole: "button",
            accessibilityState: { selected: option.selected },
            key: option.id,
            onPress: () => {
              if (onSelect) {
                onSelect(option.value);
              }
            },
            style: [
              styles.trackOption,
              option.selected && styles.trackOptionSelected
            ]
          },
          React.createElement(Text, {
            numberOfLines: 1,
            style: [
              styles.trackOptionLabel,
              option.selected && styles.trackOptionLabelSelected
            ]
          }, option.label),
          React.createElement(Text, {
            numberOfLines: 2,
            style: styles.trackOptionPurpose
          }, option.purpose)
        )
      )
    )
  );
}

function ResourcePill({ label, value }) {
  return React.createElement(
    View,
    { style: styles.resourcePill },
    React.createElement(Text, { style: styles.resourceLabel }, label),
    React.createElement(Text, { style: styles.resourceValue }, String(value))
  );
}

function BuildingSlot({ slot, onPress }) {
  const left = `${Math.round((slot.layout.x - slot.layout.width / 2) * 100)}%`;
  const top = `${Math.round((slot.layout.y - slot.layout.height / 2) * 100)}%`;
  const width = `${Math.round(slot.layout.width * 100)}%`;
  const height = `${Math.round(slot.layout.height * 100)}%`;
  const visualState = slot.visualState ?? {};

  return React.createElement(
    Pressable,
    {
      accessibilityLabel: slot.label,
      accessibilityRole: "button",
      onPress: () => {
        if (onPress) {
          onPress(slot.tapResult ?? createBuildingTapResult(slot));
        }
      },
      style: [
        styles.buildingSlot,
        visualState.isPremiumVisual && styles.buildingSlotPremium,
        visualState.isSignatureVisual && styles.buildingSlotSignature,
        slot.isLocked && styles.buildingSlotLocked,
        slot.isUpgrading && styles.buildingSlotUpgrading,
        slot.isCompleted && styles.buildingSlotCompleted,
        slot.isMaxLevel && styles.buildingSlotMaxLevel,
        {
          left,
          top,
          width,
          height,
          zIndex: slot.layout.layer
        }
      ]
    },
    React.createElement(View, {
      style: [
        styles.buildingGlow,
        visualState.glow === "construction" && styles.buildingGlowConstruction,
        visualState.glow === "ready" && styles.buildingGlowReady,
        visualState.glow === "premium" && styles.buildingGlowPremium,
        visualState.glow === "skill" && styles.buildingGlowSkill
      ]
    }),
    React.createElement(Text, { numberOfLines: 2, style: styles.buildingLabel }, slot.label),
    React.createElement(Text, {
      style: [
        styles.buildingLevel,
        visualState.isSignatureVisual && styles.buildingLevelSignature
      ]
    }, `L${slot.level}`),
    slot.lockedRequirement
      ? React.createElement(Text, { numberOfLines: 2, style: styles.lockedText }, slot.lockedRequirement.label)
      : null
  );
}

function UpgradeModal({ modal, onClose, onConfirm, onProPress }) {
  return React.createElement(
    View,
    { style: styles.modalOverlay },
    React.createElement(
      View,
      { style: styles.upgradeModal },
      React.createElement(
        View,
        { style: styles.modalHeader },
        React.createElement(Text, { numberOfLines: 2, style: styles.modalTitle }, modal.title),
        React.createElement(
          Pressable,
          {
            accessibilityLabel: modal.closeAction.label,
            accessibilityRole: "button",
            onPress: onClose,
            style: styles.modalCloseButton
          },
          React.createElement(Text, { style: styles.modalCloseText }, "X")
        )
      ),
      React.createElement(
        View,
        { style: styles.modalLevelRow },
        React.createElement(LevelPill, { summary: modal.currentLevel }),
        React.createElement(Text, { style: styles.modalArrow }, "->"),
        React.createElement(LevelPill, { summary: modal.nextLevel })
      ),
      React.createElement(ModalInfoRow, {
        label: modal.coinCost.label,
        value: `${modal.coinCost.coins}`
      }),
      React.createElement(ModalInfoRow, {
        label: modal.challenge.label,
        value: modal.challenge.requirement
      }),
      React.createElement(ModalInfoRow, {
        label: modal.timers.free.label,
        value: modal.timers.free.formatted
      }),
      React.createElement(ModalInfoRow, {
        label: modal.timers.pro.label,
        value: modal.timers.pro.formatted
      }),
      modal.proUpsell
        ? React.createElement(ProConversionCard, {
            conversion: modal.proUpsell,
            onPress: onProPress,
            style: styles.proUpsell
          })
        : null,
      React.createElement(
        Pressable,
        {
          accessibilityLabel: modal.confirmAction.label,
          accessibilityRole: "button",
          disabled: modal.confirmAction.disabled,
          onPress: () => {
            if (onConfirm) {
              onConfirm(modal);
            }
          },
          style: [
            styles.upgradeConfirmButton,
            modal.confirmAction.disabled && styles.upgradeConfirmButtonDisabled
          ]
        },
        React.createElement(Text, { style: styles.upgradeConfirmText }, modal.confirmAction.label)
      )
    )
  );
}

function ProConversionCard({ conversion, onPress, style }) {
  return React.createElement(
    Pressable,
    {
      accessibilityLabel: conversion.cta,
      accessibilityRole: "button",
      onPress,
      style
    },
    React.createElement(Text, { style: styles.proUpsellTitle }, conversion.title),
    conversion.body
      ? React.createElement(Text, { style: styles.proUpsellBody }, conversion.body)
      : null,
    React.createElement(Text, { style: styles.proUpsellCta }, conversion.cta)
  );
}

function LevelPill({ summary }) {
  return React.createElement(
    View,
    { style: styles.levelPill },
    React.createElement(Text, { style: styles.levelPillLabel }, summary.label),
    React.createElement(Text, { style: styles.levelPillValue }, `L${summary.level}`)
  );
}

function ModalInfoRow({ label, value }) {
  return React.createElement(
    View,
    { style: styles.modalInfoRow },
    React.createElement(Text, { style: styles.modalInfoLabel }, label),
    React.createElement(Text, { numberOfLines: 2, style: styles.modalInfoValue }, value)
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#0d1017"
  },
  skyGlow: {
    position: "absolute",
    left: -60,
    right: -60,
    top: -100,
    height: 240,
    backgroundColor: "rgba(53, 100, 132, 0.3)",
    transform: [{ rotate: "-4deg" }]
  },
  topBar: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    zIndex: 20
  },
  resourceGroup: {
    flexDirection: "row",
    gap: 8
  },
  resourcePill: {
    minWidth: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 190, 255, 0.48)",
    backgroundColor: "rgba(8, 15, 26, 0.78)",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  resourceLabel: {
    color: "#9fd5ff",
    fontSize: 10,
    fontWeight: "800"
  },
  resourceValue: {
    color: "#f5f0df",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 1
  },
  languageButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 240, 223, 0.26)",
    backgroundColor: "rgba(10, 12, 18, 0.72)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  languageText: {
    color: "#f5f0df",
    fontSize: 12,
    fontWeight: "900"
  },
  proBadge: {
    minWidth: 92,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  proBadgeFree: {
    borderColor: "rgba(245, 240, 223, 0.26)",
    backgroundColor: "rgba(26, 28, 38, 0.76)"
  },
  proBadgeActive: {
    borderColor: "rgba(219, 178, 93, 0.78)",
    backgroundColor: "rgba(58, 40, 14, 0.84)"
  },
  proBadgeText: {
    color: "#f5f0df",
    fontSize: 12,
    fontWeight: "900"
  },
  baseCanvas: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 190, 255, 0.3)",
    backgroundColor: "#102230"
  },
  baseCanvasBackground: {
    flex: 1
  },
  baseCanvasImage: {
    opacity: 0.78
  },
  baseCanvasTone: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 13, 20, 0.2)"
  },
  outerWall: {
    position: "absolute",
    left: "7%",
    right: "7%",
    top: "8%",
    bottom: "7%",
    borderRadius: 240,
    borderWidth: 4,
    borderColor: "rgba(205, 204, 185, 0.5)",
    backgroundColor: "rgba(34, 82, 99, 0.45)"
  },
  buildingSlot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 190, 255, 0.72)",
    backgroundColor: "rgba(14, 18, 28, 0.86)",
    padding: 6
  },
  buildingSlotLocked: {
    opacity: 0.58,
    borderColor: "rgba(245, 240, 223, 0.24)"
  },
  buildingSlotPremium: {
    backgroundColor: "rgba(24, 34, 49, 0.9)"
  },
  buildingSlotSignature: {
    borderWidth: 2
  },
  buildingSlotUpgrading: {
    borderColor: "#dbb25d"
  },
  buildingSlotCompleted: {
    borderColor: "#7ee0a6"
  },
  buildingSlotMaxLevel: {
    borderColor: "#f5f0df",
    backgroundColor: "rgba(39, 36, 28, 0.92)"
  },
  buildingGlow: {
    position: "absolute",
    left: "18%",
    right: "18%",
    top: "12%",
    bottom: "12%",
    borderRadius: 999,
    backgroundColor: "rgba(76, 142, 212, 0.25)"
  },
  buildingGlowConstruction: {
    backgroundColor: "rgba(219, 178, 93, 0.34)"
  },
  buildingGlowReady: {
    backgroundColor: "rgba(126, 224, 166, 0.34)"
  },
  buildingGlowPremium: {
    backgroundColor: "rgba(245, 240, 223, 0.26)"
  },
  buildingGlowSkill: {
    backgroundColor: "rgba(159, 213, 255, 0.32)"
  },
  buildingLabel: {
    color: "#f5f0df",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  buildingLevel: {
    color: "#9fd5ff",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3
  },
  buildingLevelSignature: {
    color: "#f5f0df"
  },
  lockedText: {
    color: "#dbb25d",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center"
  },
  bottomBar: {
    minHeight: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 12
  },
  trackSelector: {
    width: 286,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 240, 223, 0.18)",
    backgroundColor: "rgba(8, 15, 26, 0.76)",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  trackSelectorTitle: {
    color: "#9fd5ff",
    fontSize: 10,
    fontWeight: "900"
  },
  trackOptionRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6
  },
  trackOption: {
    flex: 1,
    minHeight: 58,
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 240, 223, 0.16)",
    backgroundColor: "rgba(18, 25, 34, 0.84)",
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  trackOptionSelected: {
    borderColor: "rgba(143, 223, 99, 0.82)",
    backgroundColor: "rgba(24, 54, 36, 0.88)"
  },
  trackOptionLabel: {
    color: "#f5f0df",
    fontSize: 10,
    fontWeight: "900"
  },
  trackOptionLabelSelected: {
    color: "#bdf29b"
  },
  trackOptionPurpose: {
    color: "#d6d9df",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 3
  },
  skillBadge: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 190, 255, 0.42)",
    backgroundColor: "rgba(8, 15, 26, 0.78)",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  skillBadgeHeader: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  skillTierTitle: {
    flex: 1,
    color: "#9fd5ff",
    fontSize: 10,
    fontWeight: "900"
  },
  skillProBadge: {
    maxWidth: 110,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(219, 178, 93, 0.72)",
    backgroundColor: "rgba(58, 40, 14, 0.78)",
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  skillProBadgeText: {
    color: "#f5f0df",
    fontSize: 9,
    fontWeight: "900"
  },
  skillTierText: {
    color: "#f5f0df",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 1
  },
  skillTrackText: {
    color: "#9fd5ff",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 1
  },
  skillMetaText: {
    color: "#d6d9df",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2
  },
  quickBattleButton: {
    minWidth: 134,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#8fdf63",
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  quickBattleText: {
    color: "#102012",
    fontSize: 14,
    fontWeight: "900"
  },
  modalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4, 7, 12, 0.58)",
    paddingHorizontal: 18,
    zIndex: 60
  },
  upgradeModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(219, 178, 93, 0.76)",
    backgroundColor: "#111823",
    padding: 14
  },
  modalHeader: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  modalTitle: {
    flex: 1,
    color: "#f5f0df",
    fontSize: 18,
    fontWeight: "900"
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 240, 223, 0.22)"
  },
  modalCloseText: {
    color: "#f5f0df",
    fontSize: 12,
    fontWeight: "900"
  },
  modalLevelRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8
  },
  modalArrow: {
    color: "#9fd5ff",
    fontSize: 14,
    fontWeight: "900"
  },
  levelPill: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 190, 255, 0.35)",
    backgroundColor: "rgba(10, 23, 34, 0.88)",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  levelPillLabel: {
    color: "#9fd5ff",
    fontSize: 10,
    fontWeight: "900"
  },
  levelPillValue: {
    color: "#f5f0df",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2
  },
  modalInfoRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 240, 223, 0.09)",
    gap: 12
  },
  modalInfoLabel: {
    flex: 1,
    color: "#9fd5ff",
    fontSize: 11,
    fontWeight: "900"
  },
  modalInfoValue: {
    flex: 1.2,
    color: "#f5f0df",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right"
  },
  proUpsell: {
    minHeight: 82,
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(219, 178, 93, 0.72)",
    backgroundColor: "rgba(58, 40, 14, 0.78)",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  proUpsellTitle: {
    color: "#f5f0df",
    fontSize: 13,
    fontWeight: "900"
  },
  proUpsellBody: {
    color: "#e6d6ad",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  proUpsellCta: {
    color: "#9fd5ff",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6
  },
  upgradeConfirmButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#8fdf63",
    marginTop: 12,
    paddingHorizontal: 14
  },
  upgradeConfirmButtonDisabled: {
    opacity: 0.5
  },
  upgradeConfirmText: {
    color: "#102012",
    fontSize: 13,
    fontWeight: "900"
  }
});
