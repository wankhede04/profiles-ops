"""
PDF generation service.

Renders the final (or tailored) editable JSON + locked profile data into a
styled HTML resume and converts it to PDF using WeasyPrint.
"""

import os
import re
from datetime import date
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

_TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "tailoring"


def _media_root() -> Path:
    root = os.environ.get("MEDIA_ROOT", str(Path(__file__).resolve().parents[4] / "media"))
    return Path(root)


def _safe_filename(value: str) -> str:
    return re.sub(r"[^a-z0-9_-]", "_", value.lower()).strip("_")


def render_resume_pdf(profile, version) -> str:
    """
    Render resume to PDF, persist to MEDIA_ROOT, and return the absolute path.

    Returns the file path string so callers can store it and serve it later.
    """
    from weasyprint import HTML  # imported here to keep it mockable in tests

    editable = version.export_editable
    context = {
        **profile.locked_data,
        **editable,
        "generated_date": date.today().isoformat(),
    }

    env = Environment(loader=FileSystemLoader(str(_TEMPLATES_DIR)), autoescape=True)
    template = env.get_template("resume.html")
    html_content = template.render(**context)

    media_dir = _media_root()
    media_dir.mkdir(parents=True, exist_ok=True)

    filename = (
        f"{_safe_filename(profile.profile_id)}"
        f"_{_safe_filename(version.company)}"
        f"_{date.today().isoformat()}.pdf"
    )
    filepath = media_dir / filename

    HTML(string=html_content, base_url=str(_TEMPLATES_DIR)).write_pdf(str(filepath))
    return str(filepath)
