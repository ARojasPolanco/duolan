import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { RankTier } from '../../core/api/models/enums';

interface RankPalette {
  light: string;
  mid: string;
  dark: string;
  edge: string;
  inner: string;
  gem: string;
}

const PALETTES: Record<RankTier, RankPalette> = {
  iron: {
    light: '#d3d7de',
    mid: '#7f8792',
    dark: '#3d434d',
    edge: '#252a32',
    inner: '#5b626d',
    gem: '#f4f6f9',
  },
  bronze: {
    light: '#f3bb8d',
    mid: '#bd704a',
    dark: '#6b3522',
    edge: '#452217',
    inner: '#8f4b30',
    gem: '#ffe0c2',
  },
  silver: {
    light: '#f4f8fc',
    mid: '#b8c2cf',
    dark: '#626c7b',
    edge: '#3e4653',
    inner: '#8a96a7',
    gem: '#ffffff',
  },
  gold: {
    light: '#ffe89b',
    mid: '#e2aa32',
    dark: '#8c5b0b',
    edge: '#5e3b04',
    inner: '#b87c18',
    gem: '#fff5bf',
  },
  platinum: {
    light: '#c3fff7',
    mid: '#3ec5bd',
    dark: '#0f6f6c',
    edge: '#074b4a',
    inner: '#168e88',
    gem: '#e7fffc',
  },
  emerald: {
    light: '#c4ffdd',
    mid: '#2fc47a',
    dark: '#0a5c3a',
    edge: '#043d27',
    inner: '#108352',
    gem: '#ecfff4',
  },
  diamond: {
    light: '#e2f7ff',
    mid: '#62b0ff',
    dark: '#184da3',
    edge: '#0b2e69',
    inner: '#2e77d2',
    gem: '#f4fcff',
  },
  master: {
    light: '#f1caff',
    mid: '#b45cf7',
    dark: '#5c149e',
    edge: '#3b0871',
    inner: '#8226d1',
    gem: '#fcecff',
  },
  grandmaster: {
    light: '#ffcbb8',
    mid: '#f05252',
    dark: '#8e1118',
    edge: '#58070d',
    inner: '#bc2022',
    gem: '#ffe6df',
  },
  challenger: {
    light: '#ddf8ff',
    mid: '#42c7ff',
    dark: '#0b519e',
    edge: '#06346d',
    inner: '#1775ca',
    gem: '#fff1b8',
  },
};

@Component({
  selector: 'app-rank-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 64 64"
      class="shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M32 4 L44 8 L57 5 L54 21 L47 35 L40 45 L32 60 L24 45 L17 35 L10 21 L7 5 L20 8 Z"
        [attr.fill]="palette().mid"
        [attr.stroke]="palette().edge"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M32 12 L42 16 L48 27 L42 37 L32 50 L22 37 L16 27 L22 16 Z"
        [attr.fill]="palette().inner"
        [attr.stroke]="palette().edge"
        stroke-width="1"
        stroke-linejoin="round"
      />
      <path d="M14 10 L16 22 L22 34 L21 18 Z" fill="#ffffff" opacity="0.16" />
      <path d="M50 10 L48 22 L42 34 L43 18 Z" fill="#000000" opacity="0.18" />
      <path
        d="M32 20 L39 31 L32 44 L25 31 Z"
        [attr.fill]="palette().gem"
        [attr.stroke]="palette().edge"
        stroke-width="0.9"
        stroke-linejoin="round"
      />
      <path
        d="M32 22 L32 42 M26 31 L38 31"
        stroke="#ffffff"
        stroke-opacity="0.35"
        stroke-width="0.8"
      />
    </svg>
  `,
})
export class RankIconComponent {
  readonly tier = input.required<RankTier>();
  readonly size = input(24);

  protected readonly palette = computed(() => PALETTES[this.tier()]);
}
