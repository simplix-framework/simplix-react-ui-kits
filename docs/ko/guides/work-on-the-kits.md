# kit 개발하기

> simplix-react 체크아웃을 기준으로 워크스페이스를 설정하고, 변경이 통과해야 하는 검사를 실행합니다.

## 시작하기 전에

- Node.js 20 이상, pnpm 10
- 이 저장소 옆의 simplix-react 체크아웃(`../simplix-react`). kit의 템플릿은 프레임워크의 CLI가 읽으므로, kit은 CLI를 포함한 이 체크아웃을 기준으로 빌드하고 테스트합니다.
- 렌더링 검사에 쓸 로컬 Chrome 또는 Chromium

## 해결 방법

### 1. 설치

```bash
cp .simplix-react.sample .simplix-react   # 선택: 프레임워크 경로를 다르게 지정
pnpm install
pnpm local:status                         # 적용된 연결 프로필과 프레임워크 경로 출력
```

연결 프로필은 `auto`입니다. 체크아웃이 있으면 `@simplix-react/*` 패키지를 체크아웃에 연결하고, 없으면 레지스트리에서 가져옵니다.

### 2. 검사 실행

```bash
pnpm typecheck
pnpm lint
pnpm test
```

| 명령 | 실행 내용 |
| --- | --- |
| `pnpm typecheck` | 모든 패키지의 타입 검사 |
| `pnpm lint` | 선언되지 않은 import, import 순환, em dash 검사, 디자인 kit과 core kit의 일치, 모든 패키지의 버전, 각 패키지의 린트(디자인 검사 포함) |
| `pnpm test` | 디자인 kit 동기화 자체 테스트, 모든 패키지의 테스트(kit마다 템플릿을 생성하고 마운트), 영역별 kit 동등성, kit별 목업 루트 생성 |

### 3. 바꾼 내용에 맞춰 다시 생성

| 바꾼 것 | 실행할 명령 |
| --- | --- |
| `.style.ts` 또는 디자인 명세 | 스타일시트가 있는 패키지에서 `pnpm design:css` |
| core kit의 `exports` | `node scripts/sync-design-kits.mjs` |
| 루트 버전 | `node scripts/sync-version.mjs` |

## 변형

### kit 하나의 템플릿만 검사

```bash
pnpm --filter @simplix-react-ui-kits/console-classic test:templates
```

### kit 하나의 목업 루트만 검사

```bash
node testing/mockup-root/run.mjs console-clarity
```

### 배포된 프레임워크로 검사

```bash
pnpm local:unlink     # SIMPLIX_PROFILE=registry
pnpm local:link       # SIMPLIX_PROFILE=local, 체크아웃으로 복귀
```

### 같은 체크아웃에서 다른 사람이나 에이전트와 함께 작업

자신이 바꾼 경로만 지정해 커밋하고, 스테이징 전에 diff를 읽으며, 자신의 것이 아닌 변경은 그대로 두세요.

## 관련 문서

- [워크스페이스 스크립트](../reference/workspace-scripts.md)
- [화면 파트 추가](./add-a-screen-part.md)
- [CONTRIBUTING](../../../CONTRIBUTING.md)
