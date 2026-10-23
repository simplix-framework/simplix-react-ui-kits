/**
 * The permission group each screen's endpoints are guarded by, named once.
 *
 * <p><b>Why a map rather than a literal at each call.</b> A screen decides what to draw with
 * `useCan("<action>", SUBJECTS.<screen>)`, and the server decides what to allow with
 * `@PreAuthorize("hasPermission('<GROUP>', '<action>')")` on the endpoint behind it. Those two have
 * to name the same group or the screen offers a button the server refuses — and a literal written
 * at the call site is a copy nobody notices going stale. Every screen reads its group from here, so
 * a group that moves on the server moves in one line.
 *
 * <p><b>A group covers a surface, not a screen.</b> `ORG_ADMIN` carries the organization tree and
 * the rank catalogue both, and `SYSTEM` carries every installation-wide setting — so two entries
 * pointing at one group is correct rather than a duplication to fold away. What is never done is
 * inventing a per-screen name the server does not know.
 *
 * <p><b>Where one group covers two different readerships, the ACTION tells them apart.</b> `SYSTEM`
 * carries the customer's own policy and notification settings, which 화면설계 9절 gives a safety
 * manager as 「일부(정책 값·알림)」, and the installation's own machinery, which 설계서 15.1 gives to
 * the system administrator alone. 설계서 14.2 closes the feature-area list at twelve, so the second
 * group is not invented: those endpoints guard their reads with `manage`, and the screens over them
 * gate on `manage` too. Four screens read that way — N-05, N-06, N-07 and N-33 — and each is a
 * frame that declares `roles: { safety: null }` on the board.
 *
 * <p>The `SAFETY_*` feature areas of design 14.2 arrive one chapter at a time: a group is
 * registered on the server the moment an endpoint names it in `@PreAuthorize`, and the screens
 * built from those endpoints name the same group here. This console's system area still runs on
 * the inherited platform groups.
 */
export const SUBJECTS = {
  /** N-01 조직 관리 — the organization tree. */
  organization: "ORG_ADMIN",
  /**
   * N-67 직위 관리 — the rank catalogue.
   *
   * <p>The same group as the tree above, which is why a role granted `edit` here could also edit
   * the tree. Every role that reads the catalogue today is granted reading only.
   */
  jobPosition: "ORG_ADMIN",
  /** N-02 사용자 계정 관리 — accounts, their invitations, notes, sessions and security profile. */
  userAccount: "USER_ADMIN",
  /**
   * The role catalogue itself — the names, read wherever a role is picked.
   *
   * <p><b>Not the group N-03's route is guarded on.</b> A 협력사 관리자 holds `USER_ADMIN` so that
   * 「자사 인력 초대」 can offer a role to choose (N-02), which means this group opens the role NAMES
   * to them by design. The matrix screen is `authPermission` below, and its route says so — guarded
   * here, a partner reached the screen with every cell refused underneath it.
   */
  userRole: "USER_ADMIN",
  /** N-03's matrix cells and N-04's grants — what a role may do, and over what. */
  authPermission: "AUTH_PERMISSION",
  /** N-04 역할 · 권한 범위 부여. */
  roleScopeGrant: "AUTH_PERMISSION",
  /**
   * N-05 보건 · 안전 권한 분리 설정. Read with `manage` — see the paragraph above.
   *
   * <p>`SYSTEM` rather than `AUTH_PERMISSION`, though the menu files it under 조직·권한: it is
   * one installation-wide switch, the same as 보안 정책 one entry above it, and the endpoints
   * behind it guard with `SYSTEM`.
   */
  healthSeparation: "SYSTEM",
  /** N-06 보안 정책 · 세션 관리. Read with `manage` — see the paragraph above. */
  securityPolicy: "SYSTEM",
  /** N-07 인증 연계 설정. Read with `manage` — see the paragraph above. */
  identityProvider: "SYSTEM",
  /** N-33 시스템 설정. Read with `manage` — see the paragraph above. */
  systemSetting: "SYSTEM",
  /**
   * N-28 공휴일 달력 — the country's non-working days and the year they belong to.
   *
   * <p>The same group as the settings above: a calendar is one installation-wide decision that
   * every deadline is counted against, and the endpoints behind it guard with `SYSTEM`.
   */
  holidayCalendar: "SYSTEM",
  /**
   * B-01 사업장 목록 and everything hanging off it — the record, the onboarding wizard, the
   * per-site settings, the closure, and the spaces and machines that stand in a workplace.
   *
   * <p>One group across all of them because the server guards them with one: every endpoint under
   * `modules/site` names `SAFETY_SITE`, so a role that may edit a workplace may also edit its
   * areas and its equipment. Splitting it here would let a screen offer what the server refuses,
   * or hide what it allows.
   */
  site: "SAFETY_SITE",
  /**
   * J-08 감사 로그, J-38 그 화면의 외부 감사자 범위, and J-05 마스터 데이터 변경 이력 — what was
   * read, changed and taken out of this installation.
   *
   * <p><b>증빙·보존's own group rather than `SYSTEM`.</b> Design 14.2 closes the feature-area list
   * at twelve and puts the audit log in 증빙·보존, so this is the group its endpoints name. Guarded
   * with `SYSTEM` it was reachable only by roles holding the installation's own machinery, and two
   * roles were given that group for this one screen — which opened every other surface it guards.
   *
   * <p>The record's own change history reads the same surface (P-18's panel), so it gates on this
   * too: a tab showing one record's slice of the audit log is the audit log.
   */
  auditLog: "SAFETY_EVIDENCE",
  /**
   * J-05 마스터 데이터 변경 이력 — what a master record used to be called.
   *
   * <p>The same group as the log above, and for the reason the two entries are not folded into
   * one: they are two screens with two routes, and a screen reads its group by its own name.
   */
  masterDataHistory: "SAFETY_EVIDENCE",
  /**
   * I-01 근로자 목록 and everything hanging off it — the registration form, the invitation and the
   * card that follow from it, and the record that somebody left.
   *
   * <p>One group across all of them because the server guards them with one: every endpoint under
   * `modules/worker` names `SAFETY_WORKFORCE`. The reading roles hold `list` and `view` of it and
   * nothing more, which is what makes 「같은 화면을 열되 쓰기 동작을 하지 못한다」 true on the server
   * rather than only in the screen.
   */
  worker: "SAFETY_WORKFORCE",
  /**
   * I-22 Import 이력, I-18 ~ I-20 그 마법사, I-10 일괄 작업 이력, I-09 중복 병합 — what came into
   * the roster, what one act did to many of its records at once, and two of them made one.
   *
   * <p>The roster's own group rather than a group of their own: design 14.2 closes the
   * feature-area list at twelve, and what an import writes IS the roster. A role that may not
   * change a person may not bring a file of them in either, and the reading roles hold `list` and
   * `view` of it and nothing more — which is what makes 「같은 화면을 열되 쓰기 동작을 하지
   * 못한다」 true on the server rather than only in the screen.
   */
  dataImport: "SAFETY_WORKFORCE",
  /** I-10 일괄 작업 이력 · 되돌리기 — the same group, for the same reason. */
  bulkOperation: "SAFETY_WORKFORCE",
  /** I-09 중복 근로자 · 협력사 병합 — the same group, for the same reason. */
  duplicateMerge: "SAFETY_WORKFORCE",
  /**
   * J-11 내보내기 작업 이력 and J-10 새 내보내기 — what left this installation as a file.
   *
   * <p>증빙·보존's group, which is where design 14.2 files taking a record away. Not the roster's,
   * though a roster export is one of the things it makes: what is guarded here is the copy
   * leaving the building rather than the list it was copied from.
   */
  exportLedger: "SAFETY_EVIDENCE",
  /**
   * N-17 정책 값 설정 and N-18 미달 경고 — the three-layer values and the warnings a pack revision
   * raises against them.
   *
   * <p>The warnings are the same group as the values they are about: a warning is a statement that
   * one stored value has stopped agreeing with its floor, so a reader who may not see the value may
   * not see the warning either.
   */
  policyValue: "SYSTEM",
  /**
   * B-05 의무 대상 판정 결과 — which duties this workplace is under, and why.
   *
   * <p>The workplace's own group rather than the knowledge base's: a verdict is judged from the
   * workplace's industry, headcount and contract value, and the endpoints behind it are guarded
   * with `SAFETY_SITE` for that reason. A role that may read a workplace may read what it is
   * under.
   */
  obligation: "SAFETY_SITE",
  /**
   * C-20 법령 레지스터 and C-36 조문–화면 대응표 — the statutes that reach this workplace and where
   * each thing they require is carried out.
   *
   * <p>One group across both because the server guards them with one, and because the second is a
   * finer cut of the first: a role that may read the register may read what its articles require.
   */
  lawRegister: "SAFETY_KNOWLEDGE",
  /** C-21 법령별 이행 점검 실행 — walking one statute duty by duty against its evidence. */
  complianceRun: "SAFETY_KNOWLEDGE",
  /** N-14 법규 팩 and N-16 개정 영향 분석 — what the packs supply, and what a new version changes. */
  lawPack: "SYSTEM",
  /** N-19 보존 정책 설정 — how long each kind of document is kept, and how its expiry arrives. */
  retentionPolicy: "SYSTEM",
  /** N-20 작업 제한 정책 설정 — the conditions somebody must meet before being put on a job. */
  gatePolicy: "SYSTEM",
  /** N-21 언어 설정 — which languages this installation is willing to publish in. */
  contentLanguage: "SYSTEM",
  /**
   * N-22 알림 규칙 · 에스컬레이션 and N-27 발송 · 도달 이력 — what goes out, and whether it arrived.
   *
   * <p>`SYSTEM` because design 14.2 closes the feature-area list at twelve and keeps the whole
   * notification pack inside the 시스템 row: 「한 그룹이 읽는 쪽 둘을 담으면 동작으로 구분한다」, so
   * the rules and the history are read with `list`/`view` while the installation's own machinery
   * is read with `manage`. Both are what the endpoints behind them name.
   */
  notificationRule: "SYSTEM",
  /** N-27's rows and A-12's — one dispatch and everything that happened to it. */
  notification: "SYSTEM",
  /** N-70 메시지 채널 연동 설정 — what this installation can send on, and what each costs. */
  messageChannel: "SYSTEM",
  /** N-71 메시지 템플릿 관리 — every outgoing message, per channel and per language. */
  messageTemplate: "SYSTEM",
  /** N-26 메일 발송 설정 · 테스트 — how mail leaves, and whether a test arrives. */
  mailConfig: "SYSTEM",
  /** N-29 공지사항 — what is posted where people will see it. */
  notice: "SYSTEM",
  /**
   * N-23 비상 연락망 and N-24 당직 편성 — the numbers dialled in an emergency, and who answers
   * tonight.
   *
   * <p>One group across both because the grid decides one of the numbers: 「야간 당직 안전담당」 has
   * no number of its own and today's holder is it, so a reader who may see the contact may see the
   * grid behind it.
   */
  emergencyContact: "SYSTEM",
  /**
   * A-15 결재선 템플릿 관리 — who signs what, in what order.
   *
   * <p>`SYSTEM` because design 14.2 closes the feature-area list at twelve and keeps the platform
   * services of design 13 inside the 시스템 row, which is the same reading the notification pack
   * above was given. It gates the WRITES only: an approval line names roles rather than people and
   * carries nothing personal, and everybody who receives an approval has to be able to read why —
   * so the reads behind it are guarded by being signed in and narrowed to the reader's workplaces.
   */
  approvalLine: "SYSTEM",
  /**
   * A-25 대결 정책 설정 — whether somebody may press an approval for an approver who is away.
   *
   * <p>위임은 본인이 설정하고 대결은 관리자가 허용한다, and the write is judged at `manage` because
   * this is one installation-wide setting rather than a record inside a scope (design 14.2).
   */
  delegationPolicy: "SYSTEM",
  /**
   * N-08 서비스 계정 · API 키 — what a machine may do here, and until when.
   *
   * <p>`SYSTEM` read with `manage`, the way N-05 · N-06 · N-07 · N-33 are read. The frame declares
   * `roles: { safety: null }`, and the reason is the screen's content rather than its area: an
   * account row carries a client secret and a scope list, so a safety manager holding `SYSTEM` at
   * `list`/`view` for the policy values must not reach it.
   */
  apiClient: "SYSTEM",
  /**
   * N-09 아웃바운드 웹훅 and N-10 그 전송 이력 — what this installation posts outwards, and whether
   * it arrived.
   *
   * <p>The same group and the same action as the service accounts above, for the same reason: an
   * endpoint row carries a signing secret, and a delivery row carries the body that was sent.
   */
  webhookEndpoint: "SYSTEM",
  /** N-10 웹훅 전송 이력 · 재전송 — one delivery and everything that happened to it. */
  webhookDelivery: "SYSTEM",
  /**
   * N-11 ERP · 인사 동기화 설정 and N-12 그 이력 · 충돌 해결 — which side owns each field of a
   * person, and what happened when both changed one.
   *
   * <p>`SYSTEM` with `manage` rather than the roster's `SAFETY_WORKFORCE`: what is guarded here is
   * the connection to the external system — its address and its credential — rather than the people
   * that come across it.
   */
  erpSync: "SYSTEM",
  /** N-12 ERP 동기화 이력 · 충돌 해결 — the same connection, read run by run. */
  erpSyncHistory: "SYSTEM",
  /**
   * N-13 LMS · 자격기관 연동 설정 — where a completion record is verified, and what happens when the
   * verification cannot be made.
   *
   * <p>The same group as the ERP connection above: an issuer row carries the credential this
   * installation authenticates to that issuer with.
   */
  lmsIntegration: "SYSTEM",
} as const;

/** One of the groups above. */
export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS];
