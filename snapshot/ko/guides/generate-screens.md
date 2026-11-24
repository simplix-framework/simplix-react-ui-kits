# 화면 생성하기

> 제품 화면을 직접 작성하지 않고 kit의 템플릿에서 생성합니다.

## 시작하기 전에

- 제품의 `simplix.config.ts`(`templates.from`)에 kit을 지정해 두었습니다. [제품에서 kit 사용](/ko/guides/use-a-kit-in-a-product.md)을 참고하세요.
- 도메인 패키지에 엔티티가 있습니다.

## 해결 방법

### 목록 화면과 레코드

```bash
simplix scaffold project --module projects
```

`project`의 목록 · 폼 · 상세를 모듈의 widgets에, 그리고 이를 담는 페이지와 라우트, 메뉴 항목을 생성합니다.

### 화면 설계에서 정한 내용

설계에서 정한 내용을 옵션으로 전달하면 생성된 화면에 처음부터 반영됩니다.

| 옵션 | 정하는 내용 |
| --- | --- |
| `--list-presentation <table\|cards>` | 목록이 행을 그리는 방식 (기본값 `table`) |
| `--view-toggle` | 표 목록에 카드 전환 스위치 제공 |
| `--card-title <column>` | 카드의 제목이 되는 컬럼 (기본값: 첫 컬럼) |
| `--status-badge <field>` | 상세 헤더에 레코드 배지로 그릴 필드 |
| `--text-filter <fields>` | 필터를 만들 텍스트 필드, 쉼표로 구분 |
| `--menu-group <key>` | 메뉴 항목이 들어갈 그룹 |
| `--menu-icon <name>` | 메뉴 항목의 아이콘 |
| `--blocks` | 화면이 템플릿과 달라지는 부분을 작성하는 `page.blocks.tsx`도 생성 |

```bash
simplix scaffold task --module tasks --list-presentation cards --card-title title --status-badge completed --blocks
```

### 다른 종류의 페이지

```bash
simplix add-page <kind> <name> --module <module>
simplix add-page <kind> <name> --app <app>
```

| 종류 | 그리는 내용 |
| --- | --- |
| `record-page` | 레코드 하나를 단독 페이지로 |
| `dashboard-page` | 대시보드 그리드의 카드 |
| `static-page` | 고정된 내용 |
| `error-page` | 찾을 수 없음 또는 실패 페이지 |
| `auth-page` | 로그인 페이지 |
| `app-shell` | 앱의 창. 한 번만 생성 |

```bash
simplix add-page dashboard-page home --module overview
simplix add-page app-shell console --app admin --variant top-bar
```

`--variant <name>`은 같은 종류의 다른 형태를 `<kind>.<variant>.hbs`에서 그립니다. `--dry-run`은 페이지가 작성할 파일을 모두 출력하고 실제로는 작성하지 않습니다.

## 변형

### 사이트 페이지

`templates.from`이 `site-clarity`인 앱은 사이트의 페이지 종류와 변형을 생성합니다. `static-page`의 변형은 `doc`, `packs`, `checkout`, `checkout-done`, `account`, `account-section`입니다.

```bash
simplix add-page static-page pricing --app portal --variant packs
```

### 제품 고유의 형태

같은 이름의 템플릿을 제품의 `.simplix/templates/`(또는 `.simplix/templates/<app>/`)에 두세요. CLI가 kit의 템플릿보다 먼저 사용합니다. 여러 제품에 필요한 형태라면 kit에 추가하세요. [화면 파트 추가](/ko/guides/add-a-screen-part.md)를 참고하세요.

### 화면과 함께 보드 프레임 생성

앱의 `templates.storiesDir`에 디렉터리를 지정하면, 페이지를 생성할 때 Storybook 프레임도 그 디렉터리에 작성합니다. 목업 루트가 같은 화면을 그리게 됩니다.

## 관련 문서

- [화면 템플릿](/ko/core-concepts/screen-templates.md)
- [콘솔 목록](/ko/core-concepts/console-lists.md)

---

<p class="page-source"><a href="https://github.com/simplix-framework/simplix-react-ui-kits/blob/main/docs/ko/guides/generate-screens.md" target="_blank" rel="noopener noreferrer">원본 보기</a></p>
