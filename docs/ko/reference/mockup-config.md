# `mockup.config.json`

목업 루트 하나의 설정입니다. 모든 경로는 루트 기준 상대 경로입니다. 한 제품에만 해당하는 값은 모두 이 파일에 두며, mockup 패키지에는 두지 않습니다.

## 루트 키

| 키 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `uiKit` | `string` | 예 | 모든 화면을 그릴 UI kit 패키지 |
| `framework` | `string` | 아니요 | 렌더링할 simplix-react 체크아웃. 없으면 설치된 `@simplix-react/*` 패키지를 렌더링 |
| `design` | `string` | 아니요 | 루트가 사용할 디자인 (기본값 `framework`: 프레임워크 그대로) |
| `designDirs` | `string[]` | 아니요 | 루트의 디자인을 두는 디렉터리 (기본값 없음) |
| `locales` | `string[]` | 예 | 툴바에 제공할 로케일. 첫 번째가 기본값 |
| `detailPresentation` | `"panel" \| "drawer" \| "dialog" \| "page"` | 아니요 | 목록 화면에서 레코드를 여는 기본 방식 (기본값 `panel`) |
| `languageSelectorPlacement` | `string` | 아니요 | 다국어 필드에서 언어 선택기를 두는 위치 |
| `screenImports` | `string[]` | 아니요 | 화면이 UI kit 외에 쓸 수 있는 import 지정자. 화면에 쓰는 형태 그대로 적음 |
| `buttonKeys` | `string[]` | 아니요 | `check-screens`가 값을 버튼으로 판정할 추가 키 |
| `checkStages` | `{ name, command }[]` | 아니요 | `run-stages`가 실행할 단계 |
| `digest` | `object` | 아니요 | `story-digest`가 텍스트와 버튼 외에 기록할 내용 |
| `menu` | `object` | 아니요 | `console-menu`가 읽는 값 |
| `screenDesign` | `object` | 아니요 | `screen-design`이 읽는 값 |

`locales`, `detailPresentation`, `languageSelectorPlacement`는 루트의 `.storybook/preview.tsx`가 `createMockupPreview()`에 전달합니다.

## `digest`

| 키 | 타입 | 설명 |
| --- | --- | --- |
| `marks` | `{ [name]: { selector, attribute? } }` | 처음 일치한 요소의 속성 값, 또는 요소의 존재 여부 |
| `moving` | `string[]` | 저절로 바뀌는 텍스트의 정규식 |

## `menu`

| 키 | 기본값 | 설명 |
| --- | --- | --- |
| `source` | | 메뉴 상수가 있는 모듈 |
| `routes` | | 제품의 라우트 파일 디렉터리 |
| `scaffoldConfig` | | 스캐폴드 설정. `templates.story.files`를 읽음 |
| `catalog` | | 셸 카탈로그 `locales/<catalog>/<locale>.json` |
| `storyIdPrefix` | | 프레임의 스토리 ID 접두어 |
| `output` | | 작성할 파일 |
| `designApp` | | 메뉴가 속한 설계 항목의 앱 |
| `labelExceptions` | `{}` | 항목 키와, 문구가 엔티티 문구와 다른 사유 |
| `menuConstant` | `ADMIN_MENU` | 메뉴 상수의 이름 |
| `accountConstant` | `ACCOUNT_ENTRY` | 계정 항목 상수의 이름 |
| `iconModule` | `lucide-react` | 아이콘을 import하는 모듈 |
| `iconType` | `LucideIcon` | 아이콘 하나의 타입 |
| `entityCatalog` | `entity/{entity}` | `locales/` 아래에서 엔티티 문구가 있는 위치 |

## `screenDesign`

| 키 | 기본값 | 설명 |
| --- | --- | --- |
| `manifest` | | 설계 매니페스트 `{ screens, acknowledged }` |
| `routes` | | `[{ app, dir }]`: 앱별 라우트 파일 디렉터리 |
| `primaryKey` | `{entity}Id` | 엔티티 기본 키의 이름 형식 |
| `listFiles` | | 화면의 목록을 그리는 파일. `{entity}`와 `{module}`을 사용 |
| `search` | | `{ app, meta, sources }`: 앱 하나의 콘솔 검색 |
| `descriptionCatalog` | | `{ file, key, locales }`: 화면 설명 문장의 위치 |

설계 항목 하나의 필드는 [mockup 패키지 README](../../../tools/mockup/README.md)에 있습니다.

## 디자인의 `design.json`

| 키 | 타입 | 설명 |
| --- | --- | --- |
| `name` | `string` | 디자인 이름. 디렉터리 이름과 같아야 하며 `framework`는 예약어 |
| `description` | `string` | 자유 형식 설명 |
| `base` | `string` | 기반 디자인 (기본값 `framework`) |
| `colorTheme` | `string` | 프레임워크 색 프리셋. `tokens.css`가 테마인 경우 디자인 자신의 이름 |
| `overrides` | `{ [path]: { frameworkSha256, frameworkRevision } }` | `ds/` 아래 파일마다 기록 하나 |

## 예시

```json
{
  "framework": "../../simplix-react",
  "uiKit": "@simplix-react-ui-kits/console-clarity",
  "screenImports": ["../details"],
  "design": "project",
  "designDirs": ["designs"],
  "locales": ["en", "ko"],
  "detailPresentation": "drawer",
  "checkStages": [
    { "name": "check-screens", "command": "simplix-mockup check-screens" },
    { "name": "typecheck", "command": "tsc --noEmit -p tsconfig.json" }
  ]
}
```

## 함께 보기

- [`simplix-mockup` 명령](./simplix-mockup-commands.md)
