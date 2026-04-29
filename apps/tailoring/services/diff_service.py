"""
Field-level diff computation between original and AI-tailored editable JSON.

Returns a structured diff that maps directly to git-diff-style frontend rendering:
  - text fields  → line-by-line hunks (unchanged / removed / added)
  - list fields  → added / removed / unchanged item sets
  - bullets      → sequence-matched hunk lists
"""

import difflib
from typing import Any


def compute_diff(original: dict, modified: dict) -> dict:
    diff: dict[str, Any] = {}

    if "summary" in original or "summary" in modified:
        diff["summary"] = _text_diff(
            original.get("summary", ""),
            modified.get("summary", ""),
        )

    if "skills" in original or "skills" in modified:
        diff["skills"] = _list_diff(
            original.get("skills", []),
            modified.get("skills", []),
        )

    if "experience" in original or "experience" in modified:
        diff["experience"] = _experience_diff(
            original.get("experience", []),
            modified.get("experience", []),
        )

    if "projects" in original or "projects" in modified:
        diff["projects"] = _project_diff(
            original.get("projects", []),
            modified.get("projects", []),
        )

    return diff


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _text_diff(original: str, modified: str) -> dict:
    orig_lines = original.splitlines()
    mod_lines = modified.splitlines()
    lines = []
    matcher = difflib.SequenceMatcher(None, orig_lines, mod_lines, autojunk=False)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for line in orig_lines[i1:i2]:
                lines.append({"type": "unchanged", "content": line})
        elif tag in ("replace", "delete"):
            for line in orig_lines[i1:i2]:
                lines.append({"type": "removed", "content": line})
            if tag == "replace":
                for line in mod_lines[j1:j2]:
                    lines.append({"type": "added", "content": line})
        elif tag == "insert":
            for line in mod_lines[j1:j2]:
                lines.append({"type": "added", "content": line})

    return {
        "original": original,
        "modified": modified,
        "changed": original != modified,
        "lines": lines,
    }


def _list_diff(original: list, modified: list) -> dict:
    orig_set = set(original)
    mod_set = set(modified)
    # Preserve insertion order for unchanged
    unchanged = [item for item in original if item in mod_set]
    return {
        "added": [item for item in modified if item not in orig_set],
        "removed": [item for item in original if item not in mod_set],
        "unchanged": unchanged,
        "changed": orig_set != mod_set,
    }


def _bullets_diff(orig_bullets: list[str], mod_bullets: list[str]) -> list[dict]:
    result = []
    matcher = difflib.SequenceMatcher(None, orig_bullets, mod_bullets, autojunk=False)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for b in orig_bullets[i1:i2]:
                result.append({"type": "unchanged", "content": b})
        elif tag in ("replace", "delete"):
            for b in orig_bullets[i1:i2]:
                result.append({"type": "removed", "content": b})
            if tag == "replace":
                for b in mod_bullets[j1:j2]:
                    result.append({"type": "added", "content": b})
        elif tag == "insert":
            for b in mod_bullets[j1:j2]:
                result.append({"type": "added", "content": b})
    return result


def _experience_diff(original: list, modified: list) -> list:
    orig_map = {(e.get("company", ""), e.get("role", "")): e for e in original}
    mod_map = {(e.get("company", ""), e.get("role", "")): e for e in modified}

    # Keep original order; append any new entries from modified
    seen: set = set()
    ordered_keys = []
    for e in original:
        k = (e.get("company", ""), e.get("role", ""))
        ordered_keys.append(k)
        seen.add(k)
    for e in modified:
        k = (e.get("company", ""), e.get("role", ""))
        if k not in seen:
            ordered_keys.append(k)

    result = []
    for key in ordered_keys:
        orig_entry = orig_map.get(key, {})
        mod_entry = mod_map.get(key, {})
        bullet_diff = _bullets_diff(orig_entry.get("bullets", []), mod_entry.get("bullets", []))
        result.append({
            "company": key[0],
            "role": key[1],
            "changed": any(b["type"] != "unchanged" for b in bullet_diff),
            "bullets": bullet_diff,
        })
    return result


def _project_diff(original: list, modified: list) -> list:
    orig_map = {p.get("name", ""): p for p in original}
    mod_map = {p.get("name", ""): p for p in modified}

    seen: set = set()
    ordered_names = []
    for p in original:
        n = p.get("name", "")
        ordered_names.append(n)
        seen.add(n)
    for p in modified:
        n = p.get("name", "")
        if n not in seen:
            ordered_names.append(n)

    result = []
    for name in ordered_names:
        orig_proj = orig_map.get(name, {})
        mod_proj = mod_map.get(name, {})
        desc_diff = _text_diff(orig_proj.get("description", ""), mod_proj.get("description", ""))
        bullet_diff = _bullets_diff(orig_proj.get("bullets", []), mod_proj.get("bullets", []))
        result.append({
            "name": name,
            "changed": desc_diff["changed"] or any(b["type"] != "unchanged" for b in bullet_diff),
            "description": desc_diff,
            "bullets": bullet_diff,
        })
    return result
