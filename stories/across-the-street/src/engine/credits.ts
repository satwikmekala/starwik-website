import { BEATS } from './copy.ts'

/** The credits page at the end of the story (also reachable from the menu). */
export function creditsMarkup() {
  return `<footer class="ats-credits" id="ats-credits" tabindex="-1" aria-labelledby="ats-credits-title">
    <h2 id="ats-credits-title" class="ats-accent">${BEATS.ui.creditsTitle}</h2>
    <p>${BEATS.ui.colophon}</p>
    <dl>
      <dt>Story</dt><dd>“Across the Street” — text adapted into beats from the thought <em>across the street</em>.</dd>
      <dt>Drawings</dt><dd>All illustrations are original, authored as grid maps and stair-stepped primitives and compiled to pixels in code (<code>stories/across-the-street/src/art</code>). No third-party artwork or icons are used.</dd>
      <dt>Story type</dt><dd><a href="https://github.com/LCTipografi/BDO-Grotesk">BDO Grotesk</a> by Deni Anggara / Lokal Container. Copyright 2020 The BDO Grotesk Project Authors. Licensed under the SIL Open Font License 1.1 — <a href="/stories/across-the-street/fonts/BDO-Grotesk-OFL.txt">licence text</a>.</dd>
      <dt>Accent type</dt><dd><a href="https://github.com/Instrument/instrument-serif">Instrument Serif</a> by Rodrigo Fuenzalida &amp; Jordan Egstad. Copyright 2022 The Instrument Serif Project Authors. Licensed under the SIL Open Font License 1.1 — <a href="/stories/across-the-street/fonts/Instrument-Serif-OFL.txt">licence text</a>.</dd>
      <dt>Motion</dt><dd><a href="https://gsap.com">GSAP</a> and ScrollTrigger by GreenSock (Webflow), used under the <a href="https://gsap.com/standard-license">GSAP Standard “No Charge” License</a>.</dd>
      <dt>Technique</dt><dd>Greedy rectangle merging after <a href="https://github.com/LeSnow-Ye/pix2svg">pix2svg</a> (MIT) and Shaw’s “vector pixels” notes; inspired in feel by the <a href="https://nabiu.studio/digital-home-zine/essay">Digital Home Zine</a> by Núria Gispert / Nabiu Studio. Nothing was copied from either.</dd>
    </dl>
    <p><a href="#ats-top" data-readagain>${BEATS.ui.readAgain}</a></p>
  </footer>`
}
