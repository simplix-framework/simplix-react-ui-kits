// The bar and footer words and the glyphs every fixture page shares, in the languages the reference
// was measured in. The brand is a box the size of a mark and the owner a placeholder; the page copy
// of the other fixtures is the reference product's own words.

export type Locale = "en" | "ko";

const links = (terms: string, privacy: string, business: string) => [
  { key: "terms", label: terms, href: "/terms" },
  { key: "privacy", label: privacy, href: "/privacy", emphasis: true },
  { key: "business", label: business, href: "/business" },
];

export const shellCopy = {
  en: {
    home: "Home",
    navLabel: "Site",
    menu: "Menu",
    intro: "Product",
    pricing: "Pricing",
    download: "Download",
    help: "Help",
    startFree: "Start free",
    myAccount: "My account",
    company: "© Example Inc.",
    legal: "Legal",
    footerLinks: links("Terms of use", "Privacy policy", "Business information and refunds"),
  },
  ko: {
    home: "처음으로",
    navLabel: "사이트",
    menu: "메뉴",
    intro: "소개",
    pricing: "요금제",
    download: "내려받기",
    help: "도움말",
    startFree: "무료로 시작",
    myAccount: "내 계정",
    company: "© Example Inc.",
    legal: "법적 고지",
    footerLinks: links("이용약관", "개인정보 처리방침", "사업자 정보와 환불"),
  },
} as const;

const stroke = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;

/** Stand-ins for the product's glyphs, at the sizes the parts draw them. */
export const glyph = {
  brand: (
    <svg width="103" height="20" viewBox="0 0 103 20" aria-hidden="true">
      <rect width="103" height="20" rx="4" fill="currentColor" opacity="0.15" />
    </svg>
  ),
  download: (
    <svg {...stroke}>
      <path d="M12 15V3m0 12-4-4m4 4 4-4M4 21h16" />
    </svg>
  ),
  play: (
    <svg {...stroke}>
      <path d="M7 4v16l13-8z" />
    </svg>
  ),
  stop: (
    <svg {...stroke}>
      <path d="M6 6h12v12H6z" />
    </svg>
  ),
  lock: (
    <svg {...stroke}>
      <path d="M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  check: (
    <svg {...stroke}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  ),
  pause: (
    <svg {...stroke}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  ),
  chevronDown: (
    <svg {...stroke}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  chevron: (
    <svg {...stroke}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
};

/**
 * The footer's language place as the reference draws it: the product's language picker, which the
 * kit does not draw, stands in as a box of its measured size.
 */
export const languagePlace = <span style={{ display: "block", height: 30, width: 122 }} />;
