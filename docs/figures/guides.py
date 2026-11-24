"""Figures of the getting started documents and the guides: what a reader does, in order."""
from common import (CARD, CONTENT_W, FULL, arrow_line, card, cards_row, canvas, note, row, save,
                    step_row)

from labels import per_language

X0 = 38


def fig_install_ways(lang, t):
    """Three ways to take the kits, by what the product follows."""
    c = canvas(1200, 360)
    xs, w = row(3, 34, width=CONTENT_W, x0=X0)
    cards_row(c, xs, 40, w, [
        (t("Published version", "배포 버전"), [t("follows a release", "릴리스 기준"), "pnpm add", t("a product on a released kit", "릴리스 kit 사용 제품")]),
        (t("Workspace submodule", "워크스페이스 서브모듈"), [t("follows a commit", "커밋 기준"), "workspace:*", t("builds from a clean clone", "새 클론에서 빌드 가능")]),
        (t("Linked checkout", "연결된 체크아웃"), [t("follows your working tree", "작업 트리 기준"), "link:", t("kit beside product", "kit · 제품 동시 개발")]),
    ], accents=[c.green, c.blue, c.purple], band=True, title_size=CARD)
    save(c, f"install-ways-{lang}", board=FULL)


def fig_quick_start(lang, t):
    """The steps from a kit to a generated screen."""
    c = canvas(1200, 300)
    xs, w = row(5, 30, width=CONTENT_W, x0=X0)
    h = step_row(c, xs, w, 40, [
        (t("Name the kit", "kit 지정"), "templates.from"),
        (t("Import the stylesheet", "스타일시트 import"), "styles/app.css"),
        (t("Fence the imports", "import 차단"), "kit-fence"),
        (t("Generate the window", "창 생성"), "app-shell"),
        (t("Generate a screen", "화면 생성"), "scaffold"),
    ], c.blue)
    note(c, X0, 40 + h + 30, CONTENT_W, t("Every screen generated from here on comes from the kit's templates", "이후 생성 화면 전체: kit 템플릿 기반"), c.blue)
    save(c, f"quick-start-{lang}", board=FULL)


def fig_design_override(lang, t):
    """A design override from its start to the day the framework adopts it."""
    c = canvas(1200, 480)
    xs, w = row(4, 34, width=CONTENT_W, x0=X0)
    h = step_row(c, xs, w, 40, [
        (t("Name a directory", "디렉터리 지정"), "designDirs"),
        (t("Start the override", "재정의 시작"), "new-override"),
        (t("Edit the copy", "사본 수정"), "@kit-base/<path>"),
        (t("Check it", "검사"), "check-designs"),
    ], c.purple)
    y = 40 + h + 40
    xs3, w3 = row(3, 34, width=CONTENT_W, x0=X0)
    cards_row(c, xs3, y, w3, [
        (t("Still a proposal", "제안 유지"), [t("the override differs", "프레임워크와 차이 있음"), t("keep it", "유지")]),
        (t("Adopted", "채택됨"), [t("identical to the framework", "프레임워크와 동일"), t("delete it", "재정의 삭제")]),
        (t("Fallen behind", "뒤처짐"), [t("the framework file changed", "프레임워크 파일 변경"), t("reconcile, record again", "반영 후 재기록")]),
    ], accents=[c.purple, c.green, c.orange], band=True, title_size=CARD)
    save(c, f"design-override-{lang}", board=FULL)


def fig_release(lang, t):
    """What the Release workflow does, in order."""
    c = canvas(1200, 420)
    xs, w = row(4, 34, width=CONTENT_W, x0=X0)
    h = step_row(c, xs, w, 40, [
        (t("Read the version", "버전 판독"), "X.Y.Z-SNAPSHOT"),
        (t("Install and build", "설치 · 빌드"), t("published framework", "배포된 프레임워크")),
        (t("Set the version", "버전 설정"), t("every package, changelog", "전체 패키지 · 변경 기록")),
        (t("Publish", "배포"), t("public npm registry", "공개 npm 레지스트리")),
    ], c.green)
    y = 40 + h + 34
    xs3, w3 = row(3, 34, width=CONTENT_W, x0=X0)
    step_row(c, xs3, w3, y, [
        (t("Commit and tag", "커밋 · 태그"), "v<version>"),
        (t("Open the next version", "다음 버전 시작"), "-SNAPSHOT, Unreleased"),
        (t("Create the release", "릴리스 생성"), t("notes from the commits", "커밋 기반 변경 내역")),
    ], c.green, start=5)
    save(c, f"release-{lang}", board=FULL)


per_language(fig_install_ways)
per_language(fig_quick_start)
per_language(fig_design_override)
per_language(fig_release)
