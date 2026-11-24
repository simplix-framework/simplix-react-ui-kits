# `simplix-mockup` 명령

`simplix-mockup <명령> [인자]`는 목업 루트에서 `@simplix-react-ui-kits/mockup`의 명령 하나를 실행합니다. 명령 이름이 없거나 알 수 없는 이름이면 명령 목록을 출력하고 종료 코드 2로 끝납니다.

표에 따로 적지 않은 한, 명령은 실행한 목업 루트를 읽습니다. 값은 플래그, 환경 변수, 루트의 `mockup.config.json` 순으로 읽습니다.

| 값 | 플래그 | 환경 변수 | `mockup.config.json` |
| --- | --- | --- | --- |
| 프레임워크 체크아웃 | `--framework` | `SIMPLIX_FRAMEWORK` | `framework` |
| 디자인 디렉터리 | `--design-dirs a:b` | `KIT_DESIGN_DIRS` | `designDirs` |
| 활성 디자인 | | `KIT_DESIGN` | `design` |

## `init-mockup`

목업 루트를 생성합니다. 이미 있는 파일은 덮어쓰지 않습니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--root <dir>` | 예 | 루트를 만들 디렉터리 |
| `--name <package name>` | 예 | 루트 `package.json`의 `name` |
| `--ui-kit <package>` | 예 | 모든 화면을 그릴 UI kit |
| `--framework <checkout>` | 아니요 | lockfile로 라이브러리 버전을 정하고 루트가 렌더링할 체크아웃 |
| `--workspace <dir>` | 아니요 | pnpm 워크스페이스 루트. catalog가 고정한 라이브러리는 모두 `catalog:`가 됨 |
| `--framework-version <x.y.z>` | 아니요 | 체크아웃 대신 배포된 `@simplix-react/*` 패키지에 의존 |
| `--ui-kit-version <spec>` | 아니요 | 루트가 UI kit에 의존하는 방식 (기본값 `workspace:*`) |
| `--mockup-version <spec>` | 아니요 | 루트가 mockup 패키지에 의존하는 방식 (기본값 `workspace:*`) |
| `--stylesheet <specifier>` | 아니요 | 루트 스타일시트의 import. import마다 한 번씩 순서대로 지정 (기본값: kit의 `simplix.stylesheet`, 없으면 `<ui kit>/styles/app.css`) |

## `check-screens`

`screens/` 아래의 화면이 다음에 해당하면 실패합니다. UI kit, React, `@storybook/*`, `fixtures/`와 `locales/`, mockup 설정 엔트리, 루트가 지정한 `screenImports` 이외의 것을 import한 경우, `className`이나 `style`을 쓴 경우, 선언한 버튼에 `onClick`/`onAction`/`href`도 `disabled` 사유도 없는 경우입니다. 해당 줄 바로 위에 `// ui-kit-exception: <사유>`가 있으면 예외로 처리하고 건수를 집계합니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--root <dir>` | 아니요 | 목업 루트 (기본값: 작업 디렉터리) |

루트에 `mockup.config.json`이 없거나 `uiKit`이 지정되지 않았으면 종료 코드 2입니다.

## `check-designs`

루트의 모든 디자인을 프레임워크와 대조합니다.

| 실패 조건 | 조치 |
| --- | --- |
| 재정의 경로에 프레임워크 파일이 없거나 `design.json`에 기록이 없음 | |
| 재정의가 프레임워크 파일과 동일 | 채택된 변경이므로 삭제 |
| 재정의를 기록한 뒤 프레임워크 파일이 바뀜 | 반영 후 다시 기록 |
| `colorTheme`이 프레임워크 프리셋도 아니고 `tokens.css`가 있는 디자인 자신도 아님 | |
| 기반 디자인이 순환하거나 알 수 없는 디자인을 가리킴. `tokens.css`에 `:root`, `.dark`, `:root[data-design]`, `:root[data-design].dark` 이외의 블록이 있음 | |

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--design-dirs a:b` | 아니요 | 콜론으로 구분한 디자인 디렉터리 |
| `--framework <checkout>` | 아니요 | 프레임워크 체크아웃 |

## `check-imports`

디자인의 파일이 `@simplix-react/*`를 import하면 실패합니다. 재정의는 자신이 대신하는 파일을 `@kit-base/<경로>`로 가져옵니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--design-dirs a:b` | 아니요 | 콜론으로 구분한 디자인 디렉터리 |

## `check-versions`

루트의 `package.json`이 라이브러리를 프레임워크 체크아웃의 lockfile에 없는 버전으로 고정했거나, 범위로 지정했거나, 프레임워크 UI 패키지에 필요한 라이브러리가 빠져 있으면 실패합니다. `catalog:`, `workspace:`, `link:` 의존성은 비교하지 않습니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--root <dir>` | 아니요 | 목업 루트 (기본값: 작업 디렉터리) |
| `--framework <checkout>` | 아니요 | 프레임워크 체크아웃 |

프레임워크 체크아웃을 찾지 못하면 종료 코드 2입니다.

## `new-override`

프레임워크 파일을 디자인으로 복사하고 해시와 리비전을 `design.json`에 기록합니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--design <name>` | 예 | 재정의를 둘 디자인 |
| `--file <path>` | 예 | `@simplix-react/ui` `src` 아래의 경로. 예: `base/controls/button.tsx` |
| `--designs <dir>` | 아니요 | 디자인 디렉터리 (기본값: 루트의 첫 번째 `designDirs` 항목) |
| `--framework <checkout>` | 아니요 | 프레임워크 체크아웃 |
| `--base <design>` | 아니요 | 새 디자인의 기반 디자인 |
| `--color-theme <preset>` | 아니요 | 새 디자인의 색 프리셋 |

## `extract-tokens`

제품의 앱 스타일시트에서 디자인 토큰을 추출해 `<out>/tokens.css`, `tokens.json`, `source.lock.json`에 작성합니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--entry <stylesheet>` | 예 | 제품의 앱 스타일시트 |
| `--out <dir>` | 예 | 작성할 디렉터리 |
| `--alias <specifier>=<dir>` | 아니요 | import 지정자의 위치. 여러 번 지정 가능 |
| `--stop-at <regex>` | 아니요 | 기록만 하고 포함하지 않는 import (기본값: 프레임워크 테마 엔트리) |
| `--slot-pattern <regex>` | 아니요 | 규칙을 함께 복사할 선택자 |

## `capture`

실행 중인 Storybook의 스토리와 모드마다 PNG 하나와 `report.json`을 작성합니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--url <storybook url>` | 예 | 실행 중인 Storybook |
| `--out <dir>` | 예 | 작성할 디렉터리 |
| `--modes <list>` | 아니요 | 쉼표로 구분한 모드 (기본값 `light,dark`) |
| `--filter <regex>` | 아니요 | ID가 일치하는 스토리만 |
| `--globals <text>` | 아니요 | 툴바 설정. 예: `detailPresentation:drawer;locale:ko` |
| `--concurrency <n>` | 아니요 | 동시에 여는 페이지 수 (기본값 4) |
| `--width <px>`, `--height <px>` | 아니요 | 뷰포트 (기본값 1280 × 800) |
| `--timeout <ms>` | 아니요 | 스토리당 제한 시간 (기본값 20000) |

## `story-digest`

`screens/` 아래의 스토리마다 보이는 텍스트, 버튼과 누를 수 있는지 여부, 루트가 지정한 표시를 기록합니다. 또는 두 기록을 비교합니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--url <storybook url>` | 기록 시 필수 | 실행 중인 Storybook |
| `--out <file.json>` | 기록 시 필수 | 기록 파일 |
| `--filter <regex>` | 아니요 | ID가 일치하는 스토리만 |
| `--root <dir>` | 아니요 | `digest`를 읽을 목업 루트 |
| `--channel <name>` | 아니요 | 번들 브라우저 대신 쓸 설치된 브라우저(`chrome`, `msedge`) |
| `--width <px>`, `--height <px>` | 아니요 | 뷰포트 (기본값 1440 × 900) |
| `--diff <before.json> <after.json>` | 비교 시 필수 | 달라진 스토리를 나열. 하나라도 다르면 종료 코드 1 |

## `run-stages`

루트의 `checkStages`를 순서대로 실행합니다. 앞 단계의 결과와 관계없이 모든 단계를 실행하며, 루트의 `node_modules/.bin`을 PATH에 추가합니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--root <dir>` | 아니요 | 목업 루트 (기본값: 작업 디렉터리) |

실패한 단계가 있으면 종료 코드 1, 목록이 없거나 형식이 잘못됐으면 2입니다.

## `console-menu`

제품의 메뉴 모듈에서 목업의 콘솔 메뉴를 작성합니다. 메뉴 모듈은 구문으로만 읽고 실행하지 않습니다. `menu` 키가 없는 루트에서는 아무것도 하지 않습니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--root <dir>` | 아니요 | 목업 루트 (기본값: 작업 디렉터리) |
| `--check` | 아니요 | 파일을 쓰지 않고 검사만 수행. 생성 파일이 최신이 아니거나, 제품 라우트가 있는 항목에 프레임이 없거나, 항목이나 그룹의 문구가 로케일에 없거나, 카탈로그에 쓰지 않는 메뉴 문구가 있거나, 예외로 등록하지 않은 항목의 문구가 엔티티의 복수형 레이블과 다르면 실패 |

## `screen-design`

제품의 모든 라우트 화면에 결정된 설계 항목이 있는지 검사합니다. `screenDesign` 키가 없는 루트에서는 아무것도 하지 않습니다.

| 인자 | 필수 | 설명 |
| --- | --- | --- |
| `--root <dir>` | 아니요 | 목업 루트 (기본값: 작업 디렉터리) |

라우트 화면에 항목이 없거나, 항목이 미결정이거나, 결정에 사유가 없거나, 목록을 기본 키로 정렬하거나, 화면의 페이지가 항목에서 요구한 내용을 그리지 않으면 실패합니다.

## 함께 보기

- [`mockup.config.json`](./mockup-config.md)
- [목업 루트 생성](../guides/create-a-mockup-root.md)
