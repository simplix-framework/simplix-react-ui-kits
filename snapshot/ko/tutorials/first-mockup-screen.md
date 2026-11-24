# 화면 하나로 목업 루트 만들기

> 이 튜토리얼을 마치면 `console-clarity` kit으로 화면 하나를 그리고, 목업 검사를 통과하며, 툴바 설정을 바꾸면 화면이 다시 그려지는 Storybook이 만들어집니다.

## 사전 조건

- Node.js 20 이상, pnpm 10
- 한 디렉터리 안에 `simplix-react` 체크아웃과 `simplix-react-ui-kits` 체크아웃. 각각 `pnpm install`을 실행해 둡니다.

```text
workspace/
├ simplix-react/
└ simplix-react-ui-kits/
```

## 1단계: 루트 생성

`workspace/`에서 실행하세요.

```bash
node simplix-react-ui-kits/tools/mockup/bin/simplix-mockup.mjs init-mockup \
  --root project-mockup --name project-mockup \
  --ui-kit @simplix-react-ui-kits/console-clarity \
  --framework simplix-react \
  --ui-kit-version link:../simplix-react-ui-kits/packages/console-clarity \
  --mockup-version link:../simplix-react-ui-kits/tools/mockup
```

예상 출력:

```text
mockup root .../project-mockup: created 8 (.storybook/main.ts, .storybook/preview.tsx, .gitignore, mockup.config.json, tokens/tokens.css, tsconfig.json, src/index.css, package.json)
```

## 2단계: 설치

```bash
cd project-mockup
pnpm install
```

`node_modules/.bin/simplix-mockup`이 생깁니다.

## 3단계: 화면 작성

`screens/projects.stories.tsx`를 만드세요.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "@simplix-react-ui-kits/console-clarity/badge";
import { useMockupSettings } from "@simplix-react-ui-kits/mockup/settings";

function Projects() {
  const { locale, mode } = useMockupSettings();
  return <StatusBadge enumName="ProjectStatus" value={`${locale}-${mode}`} variantMap={{ "ko-light": "success", "en-dark": "warning" }} />;
}

const meta: Meta<typeof Projects> = { title: "Projects/Status", component: Projects };
export default meta;
export const Default: StoryObj<typeof Projects> = {};
```

## 4단계: 루트 검사

```bash
pnpm check
```

예상 출력은 검사마다 한 줄입니다.

```text
screens: 1 files with @simplix-react-ui-kits/console-clarity, 0 violations, 0 declared exceptions
designs: 0, 0 component overrides, 0 problems
imports: 0 design files scanned, 0 framework imports
versions: ... 0 problems
```

## 5단계: Storybook 실행

```bash
pnpm storybook
```

`http://localhost:6006`을 열고 **Projects / Status**를 선택하세요. 배지에 `ko-light`가 표시됩니다.

## 6단계: 설정 변경

툴바에서 **Locale**을 `EN`으로, **Mode**를 `Dark`로 바꾸세요. 배지가 `en-dark`로 바뀌고 페이지가 어두워집니다. 화면이 `useMockupSettings()`로 툴바 설정을 읽었기 때문입니다.

## 7단계: 검사 실패 확인 (선택)

화면에 클래스를 추가하세요.

```tsx
return <div className="p-4"><StatusBadge enumName="ProjectStatus" value="ko-light" variantMap={{ "ko-light": "success" }} /></div>;
```

`pnpm check`를 실행하면 `check-screens`가 위반 1건을 보고합니다. 화면은 자신의 레이아웃을 직접 작성하지 않습니다. 감싼 요소를 지우면 검사가 다시 통과합니다.

## 정리

목업 루트를 생성하고, UI kit으로 화면을 그리고, 검사를 통과하고, 화면이 툴바 설정에 따라 바뀌는 것을 확인했습니다.

- 생성기의 다른 옵션과 나머지 명령: [목업 루트 생성](/ko/guides/create-a-mockup-root.md)
- 화면이 레이아웃을 직접 작성하지 않는 이유: [목업 루트](/ko/core-concepts/mockup-roots.md)
- 모든 명령: [`simplix-mockup` 명령](/ko/reference/simplix-mockup-commands.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/ko/tutorials/first-mockup-screen.md" target="_blank" rel="noopener noreferrer">GitHub에서 편집</a></p>
