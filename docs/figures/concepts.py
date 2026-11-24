"""Figures of the concept documents: how the kits, the templates and a mockup root fit together."""
from common import (BODY, CARD, CHIP, CONTENT_W, FULL, HAIRLINE, PAD, STROKE, arrow_line, card,
                    card_h, cards_row, canvas, edge_label, note, row, save, step_row, zone)

from labels import per_language

X0 = 38


def fig_kit_layers(lang, t):
    """A product draws with one design kit, which redraws the core kit, which is built on the framework."""
    c = canvas(1200, 760)
    gap = 36
    top = 40
    lines = dict(title_size=CARD)
    # Storey 1: who draws with a kit.
    xs2, w2 = row(2, gap, width=CONTENT_W, x0=X0)
    users = cards_row(c, xs2, top, w2, [
        (t("A product's screens", "제품 화면"), [t("generated from the kit's templates", "kit 템플릿 기반 생성"), t("import parts from one design kit", "디자인 kit 하나의 파트 사용")]),
        (t("A mockup root's screens", "목업 루트 화면"), [t("drawn in Storybook with the same kit", "같은 kit 기반 Storybook"), t("checked by simplix-mockup", "simplix-mockup 검사")]),
    ], accents=[c.blue, c.purple], band=True, **lines)
    # Storey 2: the design kits, one of which a product picks.
    zy = users[0][1] + users[0][3] + 78
    inner = CONTENT_W - 2 * PAD
    xs3, w3 = row(3, 28, width=inner, x0=X0 + PAD)
    items = [
        ("console-clarity", [t("redraws the slots", "슬롯 재정의 명세"), t("re-exports every segment", "전체 세그먼트 re-export")]),
        ("console-classic", [t("another design", "동일 파트의 다른 디자인"), t("re-exports every segment", "전체 세그먼트 re-export")]),
        ("site-clarity", [t("the design of another area", "다른 영역의 디자인"), t("re-exports site-core", "site-core re-export")]),
    ]
    ch = max(card_h(w3, title, body, **lines) for title, body in items)
    zh = 20 + PAD + ch + PAD
    cy = zone(c, X0, zy, CONTENT_W, zh, c.teal, t("Design kits: a product picks one", "디자인 kit: 제품별 하나 선택"))
    designs = cards_row(c, xs3, cy, w3, items, accents=c.teal, **lines)
    for b in users:
        # Clear of the boundary's name chip, which stands on its top edge at the left.
        x = max(b[0] + b[2] / 2, X0 + 470)
        arrow_line(c, x, b[1] + b[3], x, zy, c.t["fg_dim"])
    edge_label(c, 720, users[0][1] + users[0][3] + 39, t("draw every screen with one kit", "전체 화면: kit 하나로 구성"), c.t["fg_dim"])
    # Storey 3: the core kits.
    y2 = zy + zh + 78
    cores = cards_row(c, xs2, y2, w2, [
        ("console-core", [t("behaviour and markup, a slot per look", "동작 · 마크업, 모양별 data-slot"), t("screen templates, region contracts, rendered checks", "화면 템플릿 · 영역 계약 · 렌더링 검사")]),
        ("site-core", [t("the site's parts and templates", "사이트 파트 · 템플릿"), t("the site region contract", "사이트 영역 계약")]),
    ], accents=[c.green, c.green], band=True, **lines)
    for i, b in enumerate(designs):
        # The middle kit stands over the gap between the two core kits, so its arrow leaves from
        # the part of its foot that is over console-core.
        x = cores[0][0] + cores[0][2] - 70 if i == 1 else b[0] + b[2] / 2
        arrow_line(c, x, b[1] + b[3], x, y2, c.t["fg_dim"])
    edge_label(c, 760, zy + zh + 39, t("re-export and redraw", "re-export · 재정의"), c.t["fg_dim"])
    y3 = cores[0][1] + cores[0][3] + 78
    card(c, X0, y3, CONTENT_W, c.orange, "simplix-react",
         [t("components, hooks and the simplix CLI: the only thing a kit is built on", "컴포넌트 · 훅 · simplix CLI: kit의 유일한 기반")],
         band=True, **lines)
    for b in cores:
        arrow_line(c, b[0] + b[2] / 2, b[1] + b[3], b[0] + b[2] / 2, y3, c.t["fg_dim"])
    edge_label(c, 600, cores[0][1] + cores[0][3] + 39, t("built on", "기반"), c.t["fg_dim"])
    save(c, f"kit-layers-{lang}", board=FULL)


per_language(fig_kit_layers)


def fig_template_resolution(lang, t):
    """The CLI takes the first template it finds, then writes the product's kit into it."""
    c = canvas(1200, 520)
    xs, w = row(4, 34, width=CONTENT_W, x0=X0)
    h = step_row(c, xs, w, 40, [
        (t("In .simplix, per app", ".simplix, 앱별"), "templates/<app>/"),
        (t("In .simplix", ".simplix, 제품 공통"), "templates/"),
        (t("The kit, core first", "kit, core 우선"), "templates.from"),
        (t("Bundled", "CLI 내장"), t("with the CLI", "기본 템플릿")),
    ], c.blue)
    y = 40 + h + 34
    note(c, X0, y, CONTENT_W, t("The CLI takes the first template it finds, in this order", "탐색 순서: 처음 발견한 템플릿 사용"), c.blue)
    y += 92
    xs3, w3 = row(3, 60, width=CONTENT_W, x0=X0)
    boxes = cards_row(c, xs3, y, w3, [
        (t("A template", "템플릿"), [t("names no kit", "kit 이름 미기재"), "{{@kit.package}}/entity"]),
        (t("The simplix CLI", "simplix CLI"), [t("fills the kit tokens", "kit 토큰 치환"), t("before it renders", "렌더링 전 수행")]),
        (t("A generated screen", "생성된 화면"), ["console-clarity/entity", "console-classic/entity"]),
    ], accents=[c.green, c.orange, c.teal], band=True, title_size=CARD)
    for a, b in zip(boxes, boxes[1:]):
        arrow_line(c, a[0] + a[2], a[1] + a[3] / 2, b[0], b[1] + b[3] / 2, c.t["fg_dim"])
    save(c, f"template-resolution-{lang}", board=FULL)


def fig_template_parity(lang, t):
    """Every kit generates the same project, and the projects of one area are compared."""
    c = canvas(1200, 420)
    xs, w = row(5, 30, width=CONTENT_W, x0=X0)
    h = step_row(c, xs, w, 40, [
        (t("Generate", "생성"), t("every template, through the CLI", "모든 템플릿")),
        (t("Fence", "차단 검사"), t("no fenced import", "차단 import 없음")),
        (t("Compile", "컴파일"), t("every file", "생성 파일 전체")),
        (t("Mount", "마운트"), t("no throw, no console error", "오류 없음")),
        (t("Compare", "비교"), t("kit against kit", "kit 대 kit")),
    ], c.teal)
    y = 40 + h + 34
    xs2, w2 = row(2, 36, width=CONTENT_W, x0=X0)
    cards_row(c, xs2, y, w2, [
        (t("Runs once per kit", "kit마다 실행"), [t("steps 1 to 4", "1~4단계"), t("in each kit's own test", "kit별 테스트")]),
        (t("Runs once per area", "영역마다 실행"), [t("step 5", "5단계"), t("on every pair of its kits", "영역 내 kit의 모든 쌍")]),
    ], accents=[c.teal, c.green], title_size=CARD)
    save(c, f"template-parity-{lang}", board=FULL)


def fig_mockup_root(lang, t):
    """What a mockup root holds, what the mockup package gives it, and what both stand on."""
    c = canvas(1200, 560)
    xs, w = row(3, 60, width=CONTENT_W, x0=X0)
    boxes = cards_row(c, xs, 40, w, [
        (t("A mockup root", "목업 루트"), ["mockup.config.json", t("screens and fixtures", "화면 · 픽스처"), t("its own designs", "자체 디자인"), t("its own tokens", "자체 토큰")]),
        (t("The mockup package", "mockup 패키지"), [t("the Storybook preset", "Storybook 프리셋"), t("the preview and settings", "프리뷰 · 설정"), t("simplix-mockup commands", "simplix-mockup 명령"), t("the root generator", "루트 생성기")]),
        (t("What it renders", "렌더링 대상"), [t("the product's UI kit", "제품의 UI kit"), t("the framework's sources", "프레임워크 소스"), t("libraries at its versions", "프레임워크 버전 라이브러리")]),
    ], accents=[c.purple, c.blue, c.green], band=True, title_size=CARD)
    for a, b in zip(boxes, boxes[1:]):
        arrow_line(c, a[0] + a[2], a[1] + a[3] / 2, b[0], b[1] + b[3] / 2, c.t["fg_dim"])
    y = boxes[0][1] + boxes[0][3] + 34
    xs2, w2 = row(2, 36, width=CONTENT_W, x0=X0)
    cards_row(c, xs2, y, w2, [
        (t("Belongs to one product", "제품 하나의 소유"), [t("everything in the root", "루트 전체"), t("config, screens, designs, tokens", "설정 · 화면 · 디자인 · 토큰")]),
        (t("Shared by every product", "전 제품 공유"), [t("the mockup package", "mockup 패키지"), t("no product value, no design", "제품 값 · 디자인 미포함")]),
    ], accents=[c.purple, c.blue], title_size=CARD)
    save(c, f"mockup-root-{lang}", board=FULL)


def fig_console_page_order(lang, t):
    """The one order a console page draws its parts in."""
    c = canvas(1200, 760)
    parts = [
        (t("Header", "헤더"), t("the page's name and its actions", "페이지 이름 · 동작")),
        (t("Figure tiles", "수치 타일"), t("the figures lead; a tile with a filter narrows the list", "수치 우선, 필터 타일로 목록 축소")),
        (t("Notices", "공지"), t("directly under the figures they are about", "설명 대상 수치 바로 아래")),
        (t("Time range", "기간"), t("where the list is read by when its rows happened", "발생 시점 기준 목록에 표시")),
        (t("Tabs", "탭"), t("a tab may pin a field of the list", "목록 필드 고정 가능")),
        (t("Chips", "칩"), t("a quick narrowing of the rows", "행 빠른 축소")),
        (t("Rows", "행"), t("a table, or cards on a narrow pane", "표, 좁은 창은 카드")),
    ]
    y = 40
    for i, (name, sub) in enumerate(parts):
        b = card(c, X0, y, CONTENT_W, c.blue if i != 1 and i != 2 else c.orange, name, [sub], num=i + 1,
                 title_size=CARD, bullet=False)
        y = b[1] + b[3] + 14
    save(c, f"console-page-order-{lang}", board=FULL)


per_language(fig_template_resolution)
per_language(fig_template_parity)
per_language(fig_mockup_root)
per_language(fig_console_page_order)
