# 제품에서 kit 사용하기

> simplix-react 제품의 모든 화면을 kit 하나로 구성하고, kit을 우회하지 못하게 합니다.

## 시작하기 전에

- `simplix.config.ts`가 있는 simplix-react 제품
- [설치](../getting-started/installation.md)에 있는 방법 중 하나로 설치한 kit

## 해결 방법

### 1. kit 지정

```ts
// simplix.config.ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  templates: { from: "@simplix-react-ui-kits/console-clarity" },
});
```

### 2. 스타일시트 import와 소스 등록

```css
/* apps/<app>/src/index.css */
@import "@simplix-react-ui-kits/console-clarity/styles/app.css";

/* 제품의 테마 값은 kit 뒤에 두어야 우선 적용됩니다. */
@import "./styles/theme.css";

@source "../../../modules/*/src/**/*.{ts,tsx}";
```

### 3. kit의 provider로 앱 감싸기

```tsx
import { ConsoleProviders } from "@simplix-react-ui-kits/console-clarity/shell";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleProviders namespace="project-console" i18nAdapter={i18nAdapter} auth={auth} accessPolicy={accessPolicy}>
      {children}
    </ConsoleProviders>
  );
}
```

`namespace`는 운영자 설정을 저장할 때 쓰는 이름입니다. 필수 값이므로 두 앱이 실수로 같은 키를 공유하지 않습니다.

### 4. 프레임워크 import 차단

```bash
simplix kit-fence --write     # kit의 차단 규칙을 .oxlintrc.json에 기록
simplix kit-fence             # 린트 설정과 kit의 선언이 다르면 실패
```

두 번째 명령을 제품의 린트에 넣어 두면, kit 업데이트로 차단 규칙이 바뀌었을 때 바로 확인할 수 있습니다.

### 5. kit의 엔트리에서 파트 import

```tsx
import { RecordList } from "@simplix-react-ui-kits/console-clarity/entity";
import { StatusBadge } from "@simplix-react-ui-kits/console-clarity/badge";
```

콘솔 kit의 엔트리는 다음과 같습니다: `/api`, `/attachment`, `/badge`, `/clipboard`, `/dashboard`, `/datetime`, `/entity`, `/error`, `/i18n`, `/identity`, `/layout`, `/manual`, `/mock`, `/notice`, `/page`, `/peek`, `/process`, `/screen`, `/shell`.

## 변형

### 앱이 여러 개이고 kit이 다른 경우

앱마다 kit을 지정하세요. 자체 항목이 없는 앱은 최상위 값을 사용합니다.

```ts
export default defineConfig({
  templates: { from: "@simplix-react-ui-kits/console-clarity" },
  apps: {
    portal: { templates: { from: "@simplix-react-ui-kits/site-clarity" } },
  },
});
```

### 디자인 변경

`templates.from`, 스타일시트 import, 화면의 import에 있는 패키지 이름을 바꾸세요. 두 콘솔 디자인은 같은 엔트리에서 같은 이름을 export하므로 다른 부분은 바꾸지 않아도 됩니다.

### 제품 값 전달

kit에는 제품 이름이 없습니다. 제품의 값은 prop이나 provider로 파트에 전달합니다. 브랜드는 셸의 파트로, 상태 색조는 `StatusBadge`에 넘기는 색조 표로 전달합니다. 제품의 도메인 enum을 키로 하는 색조 표는 제품에 두고, kit의 `StatusVariant` 타입을 사용하세요.

## 관련 문서

- [화면 생성](./generate-screens.md)
- [kit과 디자인](../core-concepts/kits-and-designs.md)
