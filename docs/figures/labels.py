"""The two languages every figure is saved in, and the helper that draws one figure per language."""

LANGUAGES = ("en", "ko")


def per_language(draw):
    """Call `draw(lang, t)` once per language, `t` picking a label by its language."""
    for lang in LANGUAGES:
        draw(lang, lambda en, ko, lang=lang: en if lang == "en" else ko)
