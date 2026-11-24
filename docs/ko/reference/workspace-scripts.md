# 워크스페이스 스크립트

## 루트

| 스크립트 | 실행 내용 |
| --- | --- |
| `pnpm build` | 모든 패키지의 빌드 |
| `pnpm typecheck` | 모든 패키지의 타입 검사 |
| `pnpm lint` | `simplix-declared-imports`, `simplix cycles`, `simplix-em-dash`, `sync-design-kits --check`, `sync-version --check`, 그다음 모든 패키지의 `lint` |
| `pnpm test` | `sync-design-kits --test`, 모든 패키지의 `test`, 영역별 템플릿 동등성, kit별 목업 루트 |
| `pnpm test:templates` | 모든 kit에 템플릿 검사 도구 실행 후 동등성 비교 |
| `pnpm test:mockup` | kit별 목업 루트 생성: 설치, 검사, Storybook 빌드 |
| `pnpm sync-version` | 루트 버전을 모든 패키지에 기록 |
| `pnpm release` | `-SNAPSHOT` 버전이면 거부. 아니면 동기화, 빌드, 배포. 릴리스는 `Release` 워크플로로 실행 |
| `pnpm cycles` | import 순환과 패키지 의존성 순환 |
| `pnpm check:imports` | 패키지가 선언하지 않은 import |
| `pnpm local:link` | 프레임워크를 체크아웃에 연결해 설치 |
| `pnpm local:unlink` | 배포된 프레임워크로 설치 |
| `pnpm local:status` | 적용된 연결 프로필과 프레임워크 경로 출력 |

## `scripts/`

| 스크립트 | 인자 | 동작 |
| --- | --- | --- |
| `sync-design-kits.mjs` | | 디자인 kit에 빠진 export 엔트리와 re-export 파일을 작성 |
| | `--check` | 디자인 kit과 core kit이 다르면 실패 |
| | `--test` | 검사 자체를 탐지 사례와 통과 사례로 검증 |
| `sync-version.mjs` | | 루트 버전을 모든 패키지에 기록 |
| | `--check` | 버전이 다른 패키지가 있으면 실패 |
| | `--set <version>` | 루트 버전을 설정하고 모든 패키지에 기록하며 `CHANGELOG.md`도 함께 갱신 |

## kit 패키지

| 스크립트 | 있는 곳 | 실행 내용 |
| --- | --- | --- |
| `build` | 모든 패키지 | `tsup`. 엔트리는 `exports`에서 읽음 |
| `typecheck` | 모든 패키지 | `tsc --noEmit` |
| `lint` | 모든 패키지 | `oxlint`와 패키지 자체 검사. `design:check` 포함 |
| `test` | 모든 패키지 | 단위 테스트. kit은 템플릿 생성과 마운트도 수행 |
| `design:css` | 스타일시트가 있는 패키지 | 선언에서 스타일시트를 다시 생성 |
| `design:check` | 스타일시트가 있는 패키지 | 스타일시트가 선언보다 오래됐으면 실패 |
| `test:kit` | 디자인 kit | core kit의 테스트 묶음을 이 kit에 실행(`KIT_DIR=.`) |
| `test:templates` | 디자인 kit | 이 kit에 템플릿 검사 도구 실행 |

## `testing/`

| 경로 | 동작 |
| --- | --- |
| `template-harness/harness.mjs <kit dir>` | kit 하나의 모든 템플릿으로 프로젝트를 생성한 뒤 import 차단, 타입, 마운트를 검사 |
| `template-harness/parity.mjs` | 한 영역의 두 kit이 생성한 프로젝트를 비교 |
| `template-harness/run-all.mjs [--parity-only]` | 모든 kit을 한꺼번에 실행한 뒤 동등성 비교 |
| `mockup-root/run.mjs [<kit>...]` | kit별 목업 루트: 생성, 설치, 검사, Storybook 빌드 |

## 함께 보기

- [kit 개발](../guides/work-on-the-kits.md)
- [릴리스](../guides/release.md)
