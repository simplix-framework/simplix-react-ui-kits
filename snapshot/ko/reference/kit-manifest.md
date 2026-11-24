# kit 매니페스트

kit과 mockup 패키지가 `package.json`에 선언하는 내용입니다.

## kit의 `simplix` 키

| 키 | 선언하는 곳 | 타입 | 설명 |
| --- | --- | --- | --- |
| `id` | 디자인 kit | `string` | 생성 파일에 쓰는 kit 이름(`clarity`, `classic`, `site`). 이 키를 선언한 패키지가 템플릿 검사와 목업 루트 검사의 대상 kit |
| `extends` | 디자인 kit | `string` | 세그먼트를 re-export하고 템플릿을 가져오는 core kit |
| `templates` | core kit, 또는 재정의가 있는 디자인 kit | `string` | kit의 템플릿 디렉터리 |
| `overrides` | 디자인 kit | `{ [template]: reason }` | 대체하는 core 템플릿과 그 사유 |
| `fence` | core kit | `object` | 화면에서 차단하는 import. 디자인 kit은 `{{@kit.package}}`로 표기 |
| `stylesheet` | 스타일시트를 단독으로 쓸 수 없는 kit | `string[]` | 제품 스타일시트가 순서대로 시작할 import |

## 템플릿의 토큰

| 토큰 | 채워지는 값 |
| --- | --- |
| `{{@kit.package}}` | 제품이 쓰는 kit의 패키지 이름 |
| `{{@kit.label}}` | 스코프를 뺀 이름 |
| `{{@kit.id}}` | kit의 `simplix.id` |

알 수 없는 `{{@kit.*}}` 토큰은 오류입니다.

## export 엔트리

세그먼트의 엔트리에는 `source`, `types`, 빌드된 `import`를 적습니다.

```json
{
  "./entity": {
    "source": "./src/entity/index.ts",
    "types": "./src/entity/index.ts",
    "import": "./dist/entity/index.js"
  }
}
```

`source` 조건을 설정한 제품은 kit의 소스를 읽고, 그렇지 않은 제품은 `dist`를 읽습니다. 패키지의 빌드 엔트리도 이 엔트리에서 읽으므로 세그먼트는 한 곳에만 선언합니다.

## `@simplix-react-ui-kits/mockup`의 엔트리

| 엔트리 | export |
| --- | --- |
| `/preview` | `createMockupPreview(config)`, `MockupPreviewConfig` |
| `/settings` | `useMockupSettings()`, `MockupSettings`, `DetailPresentation`, `FrameMode` |
| `/preset` | Storybook 애드온: `viteFinal` |
| `/vite-plugin` | `simplixMockupKit(options)` |
| `/screen-design` | 설계 항목의 판독 함수와 검사. 루트 자체 검사에서 사용 |

### `createMockupPreview(config)`

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `locales` | `LocaleCode[]` | 예 | 툴바에 제공할 로케일. 첫 번째가 기본값 |
| `detailPresentation` | `DetailPresentation` | 아니요 | 화면을 열 때의 상세 표시 방식 (기본값 `panel`) |
| `languageSelectorPlacement` | `LanguageSelectorPlacement` | 아니요 | 제품이 정한 필드 언어 선택기 위치 |
| `frame` | `FrameMode` | 아니요 | 화면을 콘솔 창 안에 열지 여부 (기본값 `full`) |
| `appTranslations` | `Record<string, unknown>` | 아니요 | 목업 자체 문구. `import.meta.glob("../locales/*/*.json", { eager: true })`의 반환값 |
| `decorators` | `Decorator[]` | 아니요 | UI kit의 provider와 프레임. 가장 안쪽이 마지막 |
| `designs` | `readonly Design[]` | 아니요 | 툴바에 제공할 디자인 (기본값: 프레임워크의 디자인) |
| `colorTheme` | `string` | 아니요 | 화면을 열 때의 색 프리셋 (기본값: 활성 디자인의 프리셋) |

Storybook `Preview`를 반환합니다.

### `useMockupSettings()`

`{ detailPresentation, setDetailPresentation, colorTheme, mode, locale, setLocale, frame }`을 반환합니다. mockup 프리뷰의 decorator 밖에서 호출하면 예외가 발생합니다.

## mockup 패키지의 `simplix.mockupRoot`

생성된 목업 루트가 설치할 라이브러리의 이름 목록입니다. `init-mockup`은 각 버전을 프레임워크 체크아웃의 lockfile에서 가져오고, 제품의 catalog가 고정한 라이브러리는 `catalog:`로 씁니다.

## 함께 보기

- [kit과 디자인](/ko/core-concepts/kits-and-designs.md)
- [화면 템플릿](/ko/core-concepts/screen-templates.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/ko/reference/kit-manifest.md" target="_blank" rel="noopener noreferrer">GitHub에서 편집</a></p>
