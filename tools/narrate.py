#!/usr/bin/env python3
"""Generate question narration mp3s for a quiz.
Usage: /workspace/tts/venv/bin/python tools/narrate.py quizzes/<id>.json [--force]
Writes sounds/quizzes/<id>/q1.mp3, q2.mp3, ... (question + choices), Kokoro am_fenrir @0.92."""
import json, os, subprocess, sys, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro
TTS = os.environ.get("KOKORO_DIR", "/workspace/tts")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def main(path, force=False):
    quiz = json.load(open(path))
    out = os.path.join(ROOT, "sounds", "quizzes", quiz["id"]); os.makedirs(out, exist_ok=True)
    k = Kokoro(f"{TTS}/kokoro-v1.0.onnx", f"{TTS}/voices-v1.0.bin")
    for n, q in enumerate(quiz["questions"], 1):
        mp3 = os.path.join(out, f"q{n}.mp3")
        if os.path.exists(mp3) and not force: continue
        text = q["q"] + " ... " + " ... ".join(f"{'ABCD'[i]}: {c}." for i, c in enumerate(q["choices"]))
        a, sr = k.create(text, voice="am_fenrir", speed=0.92, lang="en-us")
        with tempfile.NamedTemporaryFile(suffix=".wav") as t:
            sf.write(t.name, a, sr)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", t.name, "-ac", "1", "-b:a", "40k", mp3], check=True)
        print("wrote", mp3)
if __name__ == "__main__":
    main(sys.argv[1], "--force" in sys.argv)
