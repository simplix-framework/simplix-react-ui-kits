# 목업 루트 생성하기

> 제품의 UI kit으로 그리고 자동으로 검사하는 제품 화면 Storybook을 만듭니다.

## 시작하기 전에

- 컴퓨터에 simplix-react 체크아웃이 있어야 합니다. 목업 루트는 프레임워크의 소스를 렌더링하고, 체크아웃의 lockfile에서 라이브러리 버전을 가져옵니다.
- 이 저장소의 체크아웃 또는 배포된 `@simplix-react-ui-kits/mockup`.

## 해결 방법

### 1. 루트 생성

제품 옆에 있는 이 저장소의 체크아웃에서 실행합니다.

```bash
node ../simplix-react-ui-kits/tools/mockup/bin/simplix-mockup.mjs init-mockup \
  --root mockup --name @project/mockup \
  --ui-kit @simplix-react-ui-kits/console-clarity \
  --framework ../simplix-react \
  --ui-kit-version link:../../simplix-react-ui-kits/packages/console-clarity \
  --mockup-version link:../../simplix-react-ui-kits/tools/mockup
```

`link:` 경로는 루트를 기준으로 한 상대 경로입니다. 생성기는 `package.json`, `mockup.config.json`, `tsconfig.json`, `.storybook/`, `src/index.css`, `tokens/tokens.css`와 `fixtures/`, `screens/`, `locales/` 디렉터리를 만듭니다. 이미 있는 파일은 덮어쓰지 않습니다.

### 2. 설치와 실행

```bash
cd mockup
pnpm install
pnpm storybook
```

### 3. 화면 작성

```tsx
// screens/projects.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@simplix-react-ui-kits/console-clarity/badge";
import { useMockupSettings } from "@simplix-react-ui-kits/mockup/settings";

function Projects() {
  const { locale } = useMockupSettings();
  return <StatusBadge enumName="ProjectStatus" value="active" variantMap={{ active: "success", archived: "secondary" }} />;
}

const meta: Meta<typeof Projects> = { title: "Projects/List", component: Projects };
export default meta;
export const Default: StoryObj<typeof Projects> = {};
```

화면은 UI kit, React, Storybook 타입, 픽스처와 로케일, 설정 hook만 import하며 `className`이나 `style`을 쓰지 않습니다.

### 4. 루트 검사

```bash
pnpm check
```

생성된 `check`는 `check-screens`, 타입 검사, `check-designs`, `check-imports`, `check-versions`를 실행합니다.

## 변형

### 제품의 pnpm 워크스페이스 안에 만드는 경우

`--workspace <워크스페이스 루트>`를 전달하세요. 그 워크스페이스의 catalog가 고정한 라이브러리는 모두 `catalog:` 의존성이 되므로, 루트는 제품의 앱과 똑같은 버전으로 렌더링합니다. `--ui-kit-version`과 `--mockup-version`은 생략하세요. 기본값이 `workspace:*`입니다.

### 배포된 프레임워크를 쓰는 경우

`--framework-version <x.y.z>`를 전달하세요. 루트가 체크아웃을 렌더링하지 않고 배포된 `@simplix-react/*` 패키지에 의존합니다.

### 모든 단계를 끝까지 실행하기

`&&`로 이은 명령은 첫 실패에서 멈추므로 뒤 단계의 결과를 알 수 없습니다. 단계를 `mockup.config.json`에 선언하고 `run-stages`로 실행하세요. `run-stages`는 모든 단계를 실행한 뒤 실패를 한꺼번에 보고합니다.

```json
{
  "checkStages": [
    { "name": "check-screens", "command": "simplix-mockup check-screens" },
    { "name": "typecheck", "command": "tsc --noEmit -p tsconfig.json" },
    { "name": "check-versions", "command": "simplix-mockup check-versions" }
  ]
}
```

```json
{ "scripts": { "check": "simplix-mockup run-stages" } }
```

### 제품의 토큰 추출

```bash
simplix-mockup extract-tokens --entry ../apps/admin/src/index.css --out tokens
```

제품의 스타일시트에서 `tokens/tokens.css`, `tokens.json`, `source.lock.json`을 작성합니다. 토큰은 직접 수정하지 마세요.

### 전달용 캡처

```bash
simplix-mockup capture --url http://localhost:6006 --out captures --globals "detailPresentation:drawer;locale:ko"
```

### 변경 전후로 화면이 같은지 확인하기

```bash
simplix-mockup story-digest --url http://localhost:6006 --out before.json
# 변경 작업
simplix-mockup story-digest --url http://localhost:6006 --out after.json
simplix-mockup story-digest --diff before.json after.json
```

## 관련 문서

- [화면 하나로 목업 루트 만들기](/ko/tutorials/first-mockup-screen.md)
- [`simplix-mockup` 명령](/ko/reference/simplix-mockup-commands.md)
- [`mockup.config.json`](/ko/reference/mockup-config.md)
- [목업 루트](/ko/core-concepts/mockup-roots.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/ko/guides/create-a-mockup-root.md" target="_blank" rel="noopener noreferrer">GitHub에서 편집</a></p>
