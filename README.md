# Save the Bee! – Stevie Bee quiz game
Static site (HTML/CSS/JS, SVG animation). Open `index.html?quiz=<id>`.

## Add a new quiz
1. Copy `quizzes/honeybee-basics.json` to `quizzes/<new-id>.json` (id: letters, numbers, dashes).
2. Edit `title` and `questions` (`choices`: 2–4 answers, `answer`: 0-based index of the right one, `fact`: shown after answering).
3. Add `{"id":"<new-id>","title":"..."}` to `quizzes/index.json` (set `default` to make it the no-param quiz).
4. Commit + push; link from the Short: `https://<site>/?quiz=<new-id>`.

## Question narration (automatic for new quizzes)
After adding a quiz JSON, run:
`/workspace/tts/venv/bin/python tools/narrate.py quizzes/<new-id>.json` (add `--force` to regenerate)
It reads each question plus its choices with Kokoro `am_fenrir` (speed 0.92) into `sounds/quizzes/<new-id>/q<n>.mp3`. Commit these with the quiz.
The game plays them when each question appears (after the first Play tap), stops on answer, and the 🔊 toggle mutes everything. The 15s timer starts after narration ends (answering early is allowed). Missing files are skipped silently.
