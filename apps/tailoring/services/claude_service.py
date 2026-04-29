"""
Claude API integration for JD-driven resume tailoring.

Sends locked context + editable JSON + job description to Claude and returns
the AI-modified editable JSON with the same structure.
"""

import json
import os

import anthropic

_SYSTEM_PROMPT = """\
You are an expert resume writer and ATS optimisation specialist.

RULES:
1. Return ONLY valid JSON — no markdown fences, no explanation.
2. Preserve the exact JSON structure and all keys from the editable input.
3. Only modify values, never keys or structure.
4. Do NOT invent experiences, skills, or credentials absent from the original.
5. Maximise ATS keyword overlap using terms from the job description.
6. Strengthen bullet points with action verbs; quantify impact where context permits.
7. Rewrite the summary to directly address the role's requirements.
"""

_USER_TEMPLATE = """\
LOCKED SECTIONS (context only — do not include in your response):
{locked_json}

EDITABLE SECTIONS (return these improved):
{editable_json}

JOB DESCRIPTION:
{jd_text}

Return only the modified editable JSON:"""


def tailor_resume(
    locked_data: dict,
    editable_data: dict,
    jd_text: str,
    model: str = "claude-sonnet-4-6",
) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set")

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model=model,
        max_tokens=4096,
        system=_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": _USER_TEMPLATE.format(
                    locked_json=json.dumps(locked_data, indent=2),
                    editable_json=json.dumps(editable_data, indent=2),
                    jd_text=jd_text,
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()
    # Guard against Claude wrapping JSON in markdown fences despite the prompt
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())
