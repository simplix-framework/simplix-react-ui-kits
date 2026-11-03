// The download and install guide and its troubleshooting page composed from the site parts, with the
// words of the reference the kit's measurements were taken from (measure/install.json), in English
// and in Korean. It is the page `scripts/site-demo.mjs` renders for the rendered checks. The words are
// the reference product's own, kept as written because where a line wraps is part of what is measured.
import { ActionLine, CheckCard, CopyBlock, DisclosureList, DownloadCard, DownloadGrid, InstallSteps, NoticeCard, ScreenSketch, VideoCard, type SiteCheckState } from "@simplix-react-ui-kits/site-core/install";
import { SiteCaption, SiteChip, SitePage, SitePageHead } from "@simplix-react-ui-kits/site-core/page";
import { SiteBar, SiteFooter, SiteWindow } from "@simplix-react-ui-kits/site-core/shell";

import { glyph, languagePlace, shellCopy, type Locale, themePlace, visitorActions } from "./shell-copy";

/** What the guide is drawn with. */
export interface InstallFixtureProps {
  readonly locale?: Locale;
  /** The guide, or its troubleshooting page. */
  readonly view?: "guide" | "help";
  /** A phone visitor is told to open the page on the computer that installs. */
  readonly phone?: boolean;
  /** Where the check of this computer stands. */
  readonly check?: "idle" | "running" | "ready" | "old";
  /** 0 to 1 of the install video played; null while it is not playing. */
  readonly video?: number | null;
  /** The troubleshooting question open, by its place. */
  readonly open?: number | null;
}

const copy = {
  en: {
    title: "Download and install",
    lede: "Install the app, and the PowerPoint add-in if you also work in PowerPoint. The app opens presentations without PowerPoint and guides you through the add-in when you want it.",
    phoneTitle: "Install on your computer",
    phoneBody: "StageVoice installs on a Windows PC or a Mac. Open this page on that computer to check it and download the app.",
    checkAsk: "Check this computer before installing?",
    check: "Check",
    checking: "Checking this computer…",
    thisPc: "This computer",
    ready: ["Windows 11", "Microsoft 365 PowerPoint 2409", "84GB free"],
    old: ["Windows 10", "PowerPoint 2016", "31GB free"],
    canInstall: "Ready to install",
    cannotInstall: "Not ready yet · Update PowerPoint first",
    windows: "Windows",
    windowsBody:
      "Windows 10 or later. The add-in needs Microsoft 365 or PowerPoint 2021 or later; the app works without PowerPoint. Installs into your own account without admin rights. Free voices are made on the computer itself: no internet, no credits, as often as you like.",
    windowsFile: "StageVoice-Setup-1.0.0.exe · 64 MB · Windows 10 or later · signed",
    windowsAction: "Download for Windows",
    mac: "Mac",
    macBody:
      "macOS 13 or later. The app opens presentations without PowerPoint; the add-in needs PowerPoint for Mac 16.80 or later. Free voices are made on the computer itself: no internet, no credits, as often as you like.",
    macFile: "StageVoice-1.0.0.dmg · 64 MB · macOS 13 or later · notarised",
    macAction: "Download for Mac",
    forPowerPoint: "To use it in PowerPoint too",
    steps: [
      { title: "Install the app", body: "Open the downloaded file and press Install. The 4 free voices come with it (182 MB).", shot: "Installing StageVoice" },
      { title: "Install the add-in", body: "The app opens PowerPoint's Get Add-ins. Find StageVoice and press Add.", shot: "StageVoice", add: "Add" },
      { title: "Connect", body: "Press the StageVoice tab that appears in PowerPoint; the task pane opens and shows the same six digits as the app.", shot: "482913" },
    ],
    videoTitle: "Watch the install · 2 min",
    videoPlay: "Play the install video",
    videoCaption: "From the download to the first notes, on a Windows 11 laptop.",
    notWorking: "Not installing?",
    troubleshoot: "Install troubleshooting",
    helpTitle: "Install troubleshooting",
    helpLede: "Pick the symptom to see the cause and what to do.",
    copy: "Copy the message for your admin",
    stillStuck: "Still stuck? In the app, open Settings › Connection check and press Send diagnostic record. Support answers usually within 4 hours, at the latest the next business day.",
    qa: [
      {
        q: "“Add-ins are not available in this version of Office”",
        lead: "Your PowerPoint is too old.",
        body: "StageVoice works in Microsoft 365 PowerPoint or PowerPoint 2021 and later.",
        steps: [
          "In PowerPoint, go to File › Account › Update Options › Update Now.",
          "On PowerPoint 2016 or 2019, ask your Office admin for an upgrade.",
          "Meanwhile, the app's Open without PowerPoint makes notes and voices.",
        ],
        copy: "",
      },
      {
        q: "StageVoice is not in Get Add-ins",
        lead: "Many companies block the Office add-in store.",
        body: "You cannot unblock it yourself; a Microsoft 365 admin has to deploy it to the organisation.",
        steps: [],
        copy: "Microsoft 365 admin center › Settings › Integrated apps\n› search “StageVoice” › choose who gets it\nThe add-in ID and manifest are at stagevoice.example/admin.",
      },
      { q: "The app installation is blocked", lead: "", body: "", steps: [], copy: "" },
      { q: "The task pane stays on “App not found”", lead: "", body: "", steps: [], copy: "" },
      { q: "Does it work on a Mac?", lead: "", body: "", steps: [], copy: "" },
    ],
  },
  ko: {
    title: "내려받기와 설치",
    lede: "앱을 설치하고, PowerPoint에서도 쓰려면 PowerPoint 추가기능도 설치합니다. 앱은 PowerPoint 없이도 발표 파일을 열고, 추가기능이 필요하면 설치까지 안내합니다.",
    phoneTitle: "컴퓨터에서 설치하세요",
    phoneBody: "StageVoice는 Windows PC나 Mac에 설치합니다. 설치할 컴퓨터에서 이 페이지를 열어 컴퓨터를 확인하고 앱을 내려받으세요.",
    checkAsk: "설치 전에 이 컴퓨터를 확인할까요?",
    check: "확인",
    checking: "이 컴퓨터를 확인하는 중…",
    thisPc: "이 컴퓨터",
    ready: ["Windows 11", "Microsoft 365 PowerPoint 2409", "저장 공간 84GB"],
    old: ["Windows 10", "PowerPoint 2016", "저장 공간 31GB"],
    canInstall: "설치할 수 있습니다",
    cannotInstall: "아직 설치할 수 없습니다 · PowerPoint를 먼저 업데이트하세요",
    windows: "Windows",
    windowsBody:
      "Windows 10 이상. 추가기능에는 Microsoft 365 또는 PowerPoint 2021 이상이 필요하고, 앱은 PowerPoint 없이도 씁니다. 관리자 권한 없이 내 계정에 설치합니다. 무료 음성은 컴퓨터에서 직접 만듭니다. 인터넷과 크레딧이 필요 없고 횟수 제한도 없습니다.",
    windowsFile: "StageVoice-Setup-1.0.0.exe · 64MB · Windows 10 이상 · 서명됨",
    windowsAction: "Windows용 내려받기",
    mac: "Mac",
    macBody:
      "macOS 13 이상. 앱은 PowerPoint 없이도 발표 파일을 열고, 추가기능에는 PowerPoint for Mac 16.80 이상이 필요합니다. 무료 음성은 컴퓨터에서 직접 만듭니다. 인터넷과 크레딧이 필요 없고 횟수 제한도 없습니다.",
    macFile: "StageVoice-1.0.0.dmg · 64MB · macOS 13 이상 · 공증됨",
    macAction: "Mac용 내려받기",
    forPowerPoint: "PowerPoint에서도 쓰려면",
    steps: [
      { title: "앱 설치", body: "내려받은 파일을 열고 ‘설치’를 누릅니다. 무료 음성 4종을 함께 받습니다(182MB).", shot: "StageVoice를 설치하는 중" },
      { title: "추가기능 설치", body: "앱이 PowerPoint의 ‘추가 기능 가져오기’를 열어 줍니다. StageVoice를 찾아 ‘추가’를 누릅니다.", shot: "StageVoice", add: "추가" },
      { title: "연결", body: "PowerPoint에 생긴 StageVoice 탭을 누르면 작업창이 열리고, 앱과 같은 여섯 자리 숫자가 뜹니다.", shot: "482913" },
    ],
    videoTitle: "설치 영상 보기 · 2분",
    videoPlay: "설치 영상 재생",
    videoCaption: "Windows 11 노트북에서 내려받기부터 첫 노트까지 보여 줍니다.",
    notWorking: "설치가 안 되나요?",
    troubleshoot: "설치 문제 해결",
    helpTitle: "설치 문제 해결",
    helpLede: "증상을 고르면 무엇이 원인이고 무엇을 하면 되는지 보여 줍니다.",
    copy: "관리자에게 보낼 글 복사",
    stillStuck: "그래도 안 되면 앱의 설정 › 연결 진단에서 ‘진단 기록 보내기’를 누르세요. 지원팀이 보통 4시간 안에, 늦어도 다음 영업일에 답합니다.",
    qa: [
      {
        q: "‘이 Office 버전에서는 추가기능을 쓸 수 없습니다’가 떠요",
        lead: "PowerPoint 버전이 낮습니다.",
        body: "StageVoice는 Microsoft 365 PowerPoint 또는 PowerPoint 2021 이상에서 동작합니다.",
        steps: [
          "PowerPoint에서 파일 › 계정 › 업데이트 옵션 › 지금 업데이트를 누릅니다.",
          "PowerPoint 2016·2019라면 회사의 Office 담당자에게 업그레이드를 요청하세요.",
          "그동안은 앱의 ‘PowerPoint 없이 열기’로 노트와 음성을 만들 수 있습니다.",
        ],
        copy: "",
      },
      {
        q: "추가 기능 가져오기에서 StageVoice가 안 보여요",
        lead: "",
        body: "",
        steps: [],
        copy: "Microsoft 365 관리 센터 › 설정 › 통합 앱\n› ‘StageVoice’ 검색 › 배포 대상 선택\n추가기능 ID와 매니페스트는 stagevoice.example/admin 에 있습니다.",
      },
      { q: "앱 설치가 막혔어요", lead: "", body: "", steps: [], copy: "" },
      { q: "작업창이 ‘앱을 찾을 수 없음’에서 멈춰요", lead: "", body: "", steps: [], copy: "" },
      { q: "Mac에서 쓸 수 있나요?", lead: "", body: "", steps: [], copy: "" },
    ],
  },
};

export function InstallFixture({ locale = "en", view = "guide", phone = false, check = "idle", video = null, open = 0 }: InstallFixtureProps) {
  const t = copy[locale];
  const shell = shellCopy[locale];
  const findings = (labels: readonly string[], failing: number) => labels.map((label, index) => ({ key: label, label, ok: index !== failing }));
  const state: SiteCheckState =
    check === "idle"
      ? { kind: "idle", ask: t.checkAsk, action: { id: "check", label: t.check } }
      : check === "running"
        ? { kind: "running", label: t.checking }
        : check === "ready"
          ? { kind: "done", title: t.thisPc, findings: findings(t.ready, -1), verdict: t.canInstall }
          : { kind: "done", title: t.thisPc, findings: findings(t.old, 1), verdict: t.cannotInstall };
  const status = check === "running" ? t.checking : check === "ready" ? t.canInstall : check === "old" ? t.cannotInstall : "";
  const tag = <SiteChip>{t.forPowerPoint}</SiteChip>;
  const steps = t.steps.map((step, index) => ({
    key: step.title,
    title: step.title,
    tag: index === 0 ? undefined : tag,
    body: step.body,
    media: (
      <ScreenSketch
        accentBar={index === 2}
        content={index === 0 ? { kind: "progress", label: step.shot, share: 0.6 } : index === 1 ? { kind: "pill", label: step.shot, pill: "add" in step ? step.add : "" } : { kind: "code", code: step.shot }}
      />
    ),
  }));
  return (
    <SiteWindow
      page={view === "guide" ? "download" : "installHelp"}
      bar={
        <SiteBar
          brand={glyph.brand}
          brandHref="/"
          brandLabel={shell.home}
          navLabel={shell.navLabel}
          moreLabel={shell.menu}
          links={[
            { key: "intro", label: shell.intro, href: "/" },
            { key: "pricing", label: shell.pricing, href: "/pricing" },
            { key: "download", label: shell.download, href: "/download", current: true },
            { key: "help", label: shell.help, href: "/help" },
          ]}
          actions={visitorActions(shell)}
        />
      }
      footer={<SiteFooter owner={shell.company} linksLabel={shell.legal} links={shell.footerLinks} language={languagePlace} theme={themePlace(locale)} />}
    >
      {view === "help" ? (
        <SitePage>
          <SitePageHead title={t.helpTitle} lede={t.helpLede} />
          <DisclosureList
            items={t.qa.map((item) => ({
              key: item.q,
              title: item.q,
              ...(item.lead === "" ? {} : { lead: item.lead }),
              body: item.body,
              steps: item.steps,
              ...(item.copy === "" ? {} : { copy: <CopyBlock text={item.copy} action={{ id: "copy", label: t.copy }} /> }),
            }))}
            open={open === null ? null : (t.qa[open]?.q ?? null)}
            onOpenChange={() => {}}
            mark={glyph.chevronDown}
          />
          <SiteCaption>{t.stillStuck}</SiteCaption>
        </SitePage>
      ) : (
        <SitePage>
          <SitePageHead title={t.title} lede={t.lede} />
          {phone ? <NoticeCard title={t.phoneTitle} body={t.phoneBody} /> : <CheckCard state={state} status={status} />}
          <DownloadGrid>
            <DownloadCard
              highlight={!phone}
              title={t.windows}
              body={t.windowsBody}
              {...(phone ? {} : { file: t.windowsFile, action: { id: "windows", label: t.windowsAction, icon: glyph.download } })}
            />
            <DownloadCard title={t.mac} body={t.macBody} {...(phone ? {} : { file: t.macFile, action: { id: "mac", label: t.macAction, icon: glyph.download } })} />
          </DownloadGrid>
          <InstallSteps steps={steps} />
          <VideoCard title={t.videoTitle} caption={t.videoCaption} played={video} toggleLabel={t.videoPlay} icon={video === null ? glyph.play : glyph.pause} />
          <ActionLine text={t.notWorking} action={{ id: "troubleshoot", label: t.troubleshoot, href: "/download/help" }} />
        </SitePage>
      )}
    </SiteWindow>
  );
}

export default InstallFixture;
