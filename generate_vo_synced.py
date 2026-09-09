"""
Generate section-synced Urdu voiceover.
Each narration segment is generated separately, measured, then placed
at its target frame position with silence padding so the voiceover
lands exactly on the corresponding code section.
"""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).parent
FFMPEG = ROOT / "node_modules" / "@remotion" / "compositor-win32-x64-msvc" / "ffmpeg.exe"
OUTDIR = ROOT / "public" / "vo_segments"
FPS = 30

# Segment script → target start frame (synchronized to code sections)
SEGMENTS = [
    {
        "name": "s1_intro",
        "start_frame": 5,
        "text": "Assalam o Alaikum! Aaj hum seekhenge Python ki basics.",
    },
    {
        "name": "s2_variables",
        "start_frame": 130,
        "text": (
            "Sab se pehle variables. Name mein string hai Ahmed, age mein number 25. "
            "Height decimal 5.9, aur is_student boolean True."
        ),
    },
    {
        "name": "s3_datatypes",
        "start_frame": 470,
        "text": (
            "Ab type function se data types check karte hain. "
            "Dekho: name string hai, age integer, height float."
        ),
    },
    {
        "name": "s4_operations",
        "start_frame": 890,
        "text": (
            "Ab operations. Numbers pe arithmetic; age mein 5 joro, result 30. "
            "Strings ko plus se joro; Hello Ahmed."
        ),
    },
    {
        "name": "s5_fstrings",
        "start_frame": 1335,
        "text": (
            "F-strings se variables ko sentence mein dalo. "
            "Len string ki lambai batata hai."
        ),
    },
    {
        "name": "s6_outro",
        "start_frame": 1625,
        "text": (
            "Practice karte raho, agle video mein functions seekhenge. Allah Hafiz!"
        ),
    },
]

VOICE = "ur-PK-AsadNeural"


def audio_len_ms(path: Path) -> int:
    return int(MP3(path).info.length * 1000)


async def gen_segment(name: str, text: str) -> Path:
    out = OUTDIR / f"{name}.mp3"
    comm = edge_tts.Communicate(text, VOICE, rate="-10%")
    await comm.save(str(out))
    print(f"  {name}: {out.name} ({audio_len_ms(out) / 1000:.1f}s)")
    return out


def build_parts(segments) -> list[str]:
    """Return list of ffmpeg -i inputs + filter_complex args."""
    inputs = []
    filters = []
    placeholders = []

    for idx, seg in enumerate(segments):
        path = seg["path"]
        inputs += ["-i", str(path)]
        dur_ms = audio_len_ms(path)
        # adelay places the segment at start_frame; aevalsrc isn't needed
        # since concat of padded pieces handles positioning.
        placeholders.append(f"[{idx}:a]")
        filters.append(f"[{idx}:a]adelay={seg['start_ms']}|{seg['start_ms']}[a{idx}]")

    return inputs, filters, placeholders


async def main():
    OUTDIR.mkdir(exist_ok=True)

    print("1) Generating segments...")
    for seg in SEGMENTS:
        seg["path"] = await gen_segment(seg["name"], seg["text"])
        seg["start_ms"] = int(seg["start_frame"] / FPS * 1000)

    print("\n2) Building full audio with ffmpeg adelay + amix...")
    inputs = []
    filters = []
    for idx, seg in enumerate(SEGMENTS):
        inputs += ["-i", str(seg["path"])]
        filters.append(
            f"[{idx}:a]adelay={seg['start_ms']}|{seg['start_ms']},apad[pad{idx}]"
        )

    # amix all padded streams
    mix_inputs = "".join(f"[pad{i}]" for i in range(len(SEGMENTS)))
    filters.append(f"{mix_inputs}amix=inputs={len(SEGMENTS)}:normalize=0,atrim=0:62[out]")

    cmd = [
        str(FFMPEG), "-y",
        *inputs,
        "-filter_complex", ";".join(filters),
        "-map", "[out]",
        "-ar", "44100", "-b:a", "192k",
        str(ROOT / "public" / "voiceover_urdu.mp3"),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("FFMPEG ERROR:\n", result.stderr[-2000:])
        sys.exit(1)

    out_path = ROOT / "public" / "voiceover_urdu.mp3"
    dur = audio_len_ms(out_path) / 1000
    print(f"\nFinal audio: {out_path.name} — {dur:.1f}s")

    # Write a timing manifest for the composition
    manifest = {
        "segments": [
            {
                "name": s["name"],
                "start_ms": s["start_ms"],
                "end_ms": s["start_ms"] + audio_len_ms(s["path"]),
                "text": s["text"],
            }
            for s in SEGMENTS
        ],
        "total_ms": dur * 1000,
    }
    (OUTDIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Manifest: public/vo_segments/manifest.json")


asyncio.run(main())