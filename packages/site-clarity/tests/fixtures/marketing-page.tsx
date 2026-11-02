// A product introduction composed from the site parts, with the words of the reference the kit's
// measurements were taken from (measure/marketing.json), in English and in Korean. It is the page
// `scripts/site-demo.mjs` renders for the rendered checks, and it plays no audio. The words are the
// reference product's own, kept as written because where a line wraps is part of what is measured;
// the brand and the owner are placeholders (shell-copy.tsx).
import { HeroBand, NumberedSteps, PlayerCard, ReadAlong, readWordAt, SampleList, SampleRow, SiteBars, SiteWave, SplitSection } from "@simplix-react-ui-kits/site-core/marketing";
import { SitePage } from "@simplix-react-ui-kits/site-core/page";
import { SegmentedSwitch } from "@simplix-react-ui-kits/site-core/pricing";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import { glyph, shellCopy, type Locale } from "./shell-copy";

type Voice = "free" | "premium" | "mine";

/** What the introduction is drawn with. */
export interface MarketingFixtureProps {
  readonly locale?: Locale;
  /** The voice chosen in the hero player. */
  readonly voice?: Voice;
  /** 0 to 1 of the hero sample played; null while it is stopped. */
  readonly heroAt?: number | null;
  /** The compare sample playing, with its share played. */
  readonly compare?: { readonly tier: "free" | "premium"; readonly progress: number } | null;
}

const copy = {
  en: {
    kicker: "VOICE YOUR DECK.",
    titleA: "Speaker notes",
    titleB: "in your own voice",
    lede: "Write notes for every slide inside PowerPoint, have them read in your own voice, and fit them to your time. When you present, the prompter sits right under your laptop camera.",
    download: "Download free",
    seePricing: "See pricing",
    requirements: "Windows · Microsoft 365 PowerPoint · free voices without signing up",
    voicesLabel: "Voice",
    voices: { free: "Free · Sumin", premium: "Premium · Seoyeon", mine: "My voice" },
    sentence: "We automated 32 of the tasks our teams proposed, and we save 1,240 hours every month.",
    play: "Listen",
    stop: "Stop",
    caption: {
      free: "Free voice made on your computer (Supertonic)",
      premium: "Pro · cloud voice",
      mine: "Sample voice · read 12 sentences and yours is ready in 2 minutes",
    },
    compareTitle: "Hear free and premium side by side",
    compareLede: "Switch between a free voice and a premium one before you sign up.",
    tiers: { free: "Free", premium: "Premium" },
    where: { free: "Made on this computer · no credits", premium: "Cloud · Pro" },
    listen: (tier: string) => `Listen to the ${tier} voice`,
    howTitle: "From notes to a ready presentation",
    steps: [
      { title: "Write notes", body: "Notes are written from the slide and the slides around it. Change the tone and length by chatting." },
      { title: "Make the voice", body: "Choose a free voice, a premium voice or your own. Only changed sentences are made again." },
      { title: "Fit the time", body: "Set a target time and each slide gets its share, with the notes polished to fit." },
    ],
    trust: [
      "With the on-computer engine, your presentation never leaves your computer",
      "Notes and voices made by AI are marked",
      "Your own voice only after you read the consent aloud",
    ],
  },
  ko: {
    kicker: "발표에 목소리를",
    titleA: "내 목소리로 만드는",
    titleB: "발표자 노트",
    lede: "PowerPoint 안에서 슬라이드마다 노트를 쓰고, 그 노트를 내 목소리로 읽게 하고, 발표 시간에 맞춥니다. 발표할 때는 노트북 카메라 바로 아래에 프롬프터를 띄웁니다.",
    download: "무료로 내려받기",
    seePricing: "요금제 보기",
    requirements: "Windows · Microsoft 365 PowerPoint · 무료 음성은 가입 없이",
    voicesLabel: "보이스",
    voices: { free: "무료 · 수민", premium: "프리미엄 · 서연", mine: "내 목소리" },
    sentence: "현업에서 제안한 업무 가운데 32건을 자동화했고, 매달 1,240시간을 아끼고 있습니다.",
    play: "들어 보기",
    stop: "멈춤",
    caption: {
      free: "내 컴퓨터에서 만드는 무료 음성(Supertonic)",
      premium: "Pro · 클라우드 음성",
      mine: "예시 목소리 · 내 목소리는 12문장 읽으면 2분 안에",
    },
    compareTitle: "무료와 프리미엄 비교해 듣기",
    compareLede: "무료 음성과 프리미엄을 바로 바꿔 들을 수 있어, 가입 전에 차이를 압니다.",
    tiers: { free: "무료", premium: "프리미엄" },
    where: { free: "이 컴퓨터에서 만듦 · 크레딧 안 씀", premium: "클라우드 · Pro" },
    listen: (tier: string) => `${tier} 음성 듣기`,
    howTitle: "노트부터 발표 준비까지",
    steps: [
      { title: "노트 쓰기", body: "슬라이드 내용과 앞뒤 흐름을 보고 노트를 씁니다. 대화로 말투와 길이를 바꿉니다." },
      { title: "음성 만들기", body: "무료 음성, 프리미엄, 내 목소리 가운데 고릅니다. 바뀐 문장만 다시 만듭니다." },
      { title: "시간 맞추기", body: "목표 시간을 정하면 슬라이드마다 길이를 나누고 노트를 다듬습니다." },
    ],
    trust: ["내 컴퓨터 엔진을 쓰면 발표 파일이 밖으로 나가지 않음", "AI로 만든 노트와 음성에 표시", "내 목소리는 동의 낭독 뒤에만"],
  },
} as const;

/** The reference's stand-in wave shape: a seeded speech-like envelope, so a seed always draws the same wave. */
export function seededLevels(seed: string, count: number): number[] {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  state = state || 1;
  const random = () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
  const out: number[] = [];
  let envelope = 0.3;
  for (let i = 0; i < count; i++) {
    const syllable = 0.5 + 0.5 * Math.sin(i * 1.25 + random() * 1.4);
    const gap = random() < 0.07 ? 0.1 : 1;
    envelope = envelope * 0.5 + syllable * gap * 0.5;
    out.push(Math.min(1, Math.max(0.07, envelope * (0.45 + 0.65 * random()))));
  }
  return out;
}

/** The reference's waves are 320 units wide: 80 bars. */
const BARS = 80;
const NOTE_BARS = [8, 12, 16, 8, 12, 16, 8, 12, 16, 8, 12, 16, 8, 12];
const FIT = [22, 41, 35, 52, 30];

export function MarketingFixture({ locale = "en", voice = "free", heroAt = null, compare = null }: MarketingFixtureProps) {
  const t = copy[locale];
  const shell = shellCopy[locale];
  const playing = heroAt !== null;
  const words = t.sentence.split(" ").length;
  return (
    <SiteWindow
      page="intro"
      bar={
        <SiteBar
          brand={glyph.brand}
          brandHref="/"
          brandLabel={shell.home}
          navLabel={shell.navLabel}
          moreLabel={shell.menu}
          tone="dark"
          links={[
            { key: "intro", label: shell.intro, href: "/", current: true },
            { key: "pricing", label: shell.pricing, href: "/pricing" },
            { key: "download", label: shell.download, href: "/download" },
            { key: "help", label: shell.help, href: "/help" },
          ]}
          action={{ id: "start", label: shell.startFree, href: "/signup" }}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} />}
    >
      <HeroBand
        tone="dark"
        eyebrow={t.kicker}
        title={t.titleA}
        accent={t.titleB}
        lede={t.lede}
        actions={[
          { id: "download", label: t.download, href: "/download", tone: "primary", icon: glyph.download },
          { id: "pricing", label: t.seePricing, href: "/pricing" },
        ]}
        facts={t.requirements}
        media={
          <PlayerCard
            choice={
              <SegmentedSwitch
                label={t.voicesLabel}
                value={voice}
                onValueChange={() => {}}
                options={[
                  { value: "free", label: t.voices.free },
                  { value: "premium", label: t.voices.premium },
                  { value: "mine", label: t.voices.mine },
                ]}
              />
            }
            text={<ReadAlong text={t.sentence} at={readWordAt(heroAt, words)} />}
            wave={<SiteWave levels={seededLevels(`site-hero-${voice}`, BARS)} progress={heroAt ?? 0} height={48} label={playing ? "Voice waveform, playing" : "Voice waveform"} />}
            playing={playing}
            toggleLabel={playing ? t.stop : t.play}
            toggleIcon={playing ? glyph.stop : glyph.play}
            caption={t.caption[voice]}
          />
        }
      />
      <SitePage rhythm="open">
        <SplitSection heading={t.compareTitle} lede={t.compareLede}>
          <SampleList>
            {(["free", "premium"] as const).map((tier) => {
              const on = compare?.tier === tier;
              return (
                <SampleRow
                  key={tier}
                  name={t.tiers[tier]}
                  meta={t.where[tier]}
                  text={t.sentence}
                  playing={on}
                  playingMedia={<SiteWave levels={seededLevels(`compare-${tier}`, BARS)} progress={compare?.progress ?? 0} height={30} label="Voice waveform, playing" />}
                  icon={on ? glyph.stop : glyph.play}
                  label={t.listen(t.tiers[tier])}
                />
              );
            })}
          </SampleList>
        </SplitSection>
        <NumberedSteps
          heading={t.howTitle}
          steps={t.steps.map((step, index) => ({
            key: step.title,
            title: step.title,
            body: step.body,
            media:
              index === 0 ? (
                <SiteBars bars={NOTE_BARS.map((height, at) => ({ key: `n-${String(at)}`, height }))} />
              ) : index === 1 ? (
                <SiteWave levels={seededLevels("site-step-voice", BARS)} height={52} label="Voice waveform" />
              ) : (
                <SiteBars tone="strong" bars={FIT.map((grow) => ({ key: `f-${String(grow)}`, grow }))} />
              ),
          }))}
          notes={t.trust.map((label) => ({ key: label, label }))}
          noteMark={glyph.lock}
        />
      </SitePage>
    </SiteWindow>
  );
}

export default MarketingFixture;
