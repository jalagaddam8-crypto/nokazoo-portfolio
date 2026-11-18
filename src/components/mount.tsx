import React from "react";
import { createRoot } from "react-dom/client";
import { Search } from "./Search";
import { ASCIIWake } from "./ASCIIWake";
import { EmojiReactions } from "./EmojiReactions";
import { initMetallicEmblem } from "./MetallicEmblem";

export function mountComponents() {
  const searchEl = document.getElementById("bencho-search-mount");
  if (searchEl && !searchEl.dataset.mounted) {
    searchEl.dataset.mounted = "true";
    createRoot(searchEl).render(<Search span={280} />);
  }

  const wakeEl = document.getElementById("bencho-ascii-mount");
  if (wakeEl && !wakeEl.dataset.mounted) {
    wakeEl.dataset.mounted = "true";
    createRoot(wakeEl).render(<ASCIIWake />);
  }

  const rxnEl = document.getElementById("bencho-rxn-mount");
  if (rxnEl && !rxnEl.dataset.mounted) {
    rxnEl.dataset.mounted = "true";
    createRoot(rxnEl).render(<EmojiReactions />);
  }

  const emblemEl = document.getElementById("metallic-emblem-canvas");
  if (emblemEl && !emblemEl.dataset.mounted) {
    emblemEl.dataset.mounted = "true";
    initMetallicEmblem("metallic-emblem-canvas");
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountComponents);
  } else {
    mountComponents();
  }
}
