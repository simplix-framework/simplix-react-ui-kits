# 화면 파트 추가하기

> 제품에 필요한 파트나 화면 유형이 kit에 없을 때, 영역의 core kit에 추가해 그 영역의 모든 디자인이 사용하게 합니다.

## 시작하기 전에

- 워크스페이스 설정. [kit 개발](/ko/guides/work-on-the-kits.md)을 참고하세요.
- 먼저 core kit의 `src/`에서 같은 형태가 있는지 검색하세요. 이미 있는 파트는 그대로 사용하고 다시 작성하지 않습니다.
- 영역의 영역 계약(`packages/console-core/regions.json`, `packages/site-core/regions.json`)을 읽으세요. 어느 파트가 어느 영역을 채우는지, 영역에 둘 수 있는 컨트롤이 무엇인지 적혀 있습니다.

## 해결 방법

### 1. core kit에 파트 작성

컴포넌트를 해당 세그먼트(`packages/console-core/src/<segment>/`)에 두세요. simplix-react와 kit의 기존 파트로 만듭니다. 파트에는 동작과 마크업을 두고, 모양이 있는 요소에는 모두 `data-slot`을 표시합니다.

```tsx
// packages/console-core/src/entity/project-summary.tsx
export function ProjectSummary({ name, taskCount }: { readonly name: string; readonly taskCount: number }) {
  return (
    <section data-slot="project-summary">
      <h3 data-slot="project-summary-name">{name}</h3>
      <p data-slot="project-summary-count">{taskCount}</p>
    </section>
  );
}
```

파트에는 제품 이름을 쓰지 않습니다. 제품 값(권한 주체, 브랜드 마크, enum 값별 색조)은 prop이나 provider로 받습니다.

### 2. 기본 모양 선언

파트 옆의 `.style.ts` 파일에 슬롯별 모양을 선언한 뒤 core의 스타일시트를 다시 생성하세요.

```bash
pnpm --filter @simplix-react-ui-kits/console-core design:css
```

### 3. 세그먼트에서 export

세그먼트의 index에 export를 추가하세요. 모든 디자인 kit이 세그먼트를 re-export하므로 추가 작업 없이 모든 디자인에 파트가 제공됩니다.

### 4. 디자인별로 그리기

디자인이 슬롯을 다르게 그려야 하면 그 디자인의 명세에 슬롯을 추가하고 스타일시트를 다시 생성하세요.

```bash
pnpm --filter @simplix-react-ui-kits/console-clarity design:css
```

디자인이 core의 슬롯을 그리지 않았거나 생성된 스타일시트가 선언보다 오래됐으면 `pnpm lint`가 실패합니다.

### 5. 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## 변형

### 새 세그먼트

core kit의 `package.json` `exports`에 export 엔트리를 추가한 뒤, 모든 디자인 kit에 대응하는 엔트리와 re-export 파일을 작성하세요.

```bash
node scripts/sync-design-kits.mjs
```

### 화면 형태 전체

화면 형태에는 제품이 생성할 수 있도록 core kit의 `templates/`에 템플릿도 추가합니다. kit 이름은 `{{@kit.package}}`, `{{@kit.label}}`, `{{@kit.id}}`로만 씁니다. 템플릿 검사 도구가 이 템플릿을 생성할 수 있어야 합니다. `testing/template-harness/lib/plan.mjs`에서 템플릿 이름에 명령을 지정하고, 필수 props가 있는 생성 페이지에는 `testing/template-harness/mount/page-props.mjs`에서 props를 주세요.

```bash
pnpm test:templates
```

### 영역에 두는 내용을 바꾸는 파트

`regions.json`과 파트를 함께 바꾸세요. `check-regions.mjs`는 컨트롤을 그리는 값 파트와 계약에 없는 boolean 슬롯 prop을 거부합니다.

### 디자인이 아닌 코드

포맷, API 헬퍼, 클립보드, 저장소 접근, 범용 hook은 kit이 아니라 simplix-react에 둡니다.

## 관련 문서

- [kit과 디자인](/ko/core-concepts/kits-and-designs.md)
- [화면 템플릿](/ko/core-concepts/screen-templates.md)
- [콘솔 페이지](/ko/core-concepts/console-pages.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/ko/guides/add-a-screen-part.md" target="_blank" rel="noopener noreferrer">원본 보기</a></p>
