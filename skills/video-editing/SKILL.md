---
name: video-editing
description: Add the user's own cloned voice to a screen recording - probe the video and pull scene keyframes with ffmpeg, describe them with ImageDecode (or write down what the user says in the recording with whisper-cli and clean it up), write a <stem>.timeline.json plan, and make the audio for each clip with TextToSpeech (voice_sample cloning) - and place animated cards (title, lower third, callout, step, chart) rendered with HyperFrames on the timeline's overlay track. The desktop renders the export; the agent never muxes. Use when the user asks to add a voiceover, add their voice, explain a video, redo the voice on a recording, redo clips of an existing timeline, or add a card, title or overlay to a video.
license: Apache-2.0
---

# Video Editing

Use this skill when the user gives you a video (usually a macOS screen recording in the working
directory, silent or with the user talking over it) and wants their voice added, asks to redo clips of
an existing `<stem>.timeline.json`, or wants a card (title, lower third, callout, step counter, chart)
layered over the video (see Overlay cards).

The desktop app renders `<stem>.timeline.json` as an editable timeline, so the file is the contract:
always read it first if it exists, always write it back after every step that changes it.

## Tools you may use

Only these, nothing else: `Bash` for `ffmpeg`, `whisper-cli`, `cp`, `mkdir`, `ls`, `grep` and `rm` (scratch
files only) inside the working directory, plus `node --version` and `npx hyperframes render` for cards;
`Read` and `Write` for the timeline JSON and card HTML; `ImageDecode`; `TextToSpeech`. Do not
use `WebFetch`, `WebSearch`, `find`, package managers, or any other binary, and do not look for
this skill, other skills or tools on disk: everything you need is listed below at fixed paths.

## Prerequisites

Everything below is installed by the desktop when a project is switched to the Content type. Do
not download, build, symlink or search the disk for tools, and do not create directories anywhere
under `~/.infer`; the only place you write is the working directory.

- `ffmpeg` on `PATH` (the desktop's own copy lives in `~/.infer/bin/tools/ffmpeg`). There is no `ffprobe`;
  probe with `ffmpeg -i`.
- `~/.infer/bin/tools/whisper-cli` with the model `~/.infer/models/whisper/ggml-tiny.bin` (only for
  `source_audio: transcribe`). Use a larger model only if one already exists in that directory.
- The `ImageDecode` tool (`vision.annotator.enabled` with a vision model, typically
  `ollama/qwen3-vl:2b` for a local setup) and the `TextToSpeech` tool (`text_to_speech.enabled`).
- A voice sample: a 10-30 s `.wav` of the user speaking, kept by the desktop in
  `~/.infer/models/tts/samples/`. `TextToSpeech` only accepts a bare file name inside the working
  directory, so copy the chosen sample to `./voice.wav` once. When the track's `voice_sample` in the
  timeline names a file from that folder, the user chose it on the timeline: use exactly that one and
  keep the field as written. Otherwise pick one and write its bare library name into `voice_sample`
  so the desktop shows which voice was used. When the recording itself contains the user's speech
  (`source_audio: transcribe`) and no sample is chosen, the sample can be cut from it instead (see
  Source audio); then set `voice_sample` to `"recording"`.

If any of these is missing, stop and tell the user exactly which one: tools and the model are
installed by switching the project to Content in Settings > Projects; the two agent tools are
enabled in Settings > General; voice samples are recorded in Settings > Voice samples.

Media lives in `media/` inside the working directory: the recordings and music the user added
(the desktop shows this folder as the media pool) and every voice clip you synthesize. Timeline
`src` paths point there (`media/<file>`); a bare `src` at the root is only for old projects.
Scratch files (`frames/`, `audio.wav`, `voice.wav`, `transcript.json`) stay at the root.

## Timeline contract (`<stem>.timeline.json`)

```json
{
  "version": 1,
  "duration": 42.3,
  "output": "demo.with-voice.mp4",
  "resolution": "1920x1080",
  "source_audio": "transcribe",
  "tracks": [
    {
      "id": "video",
      "kind": "video",
      "clips": [{ "id": "v1", "src": "media/demo.mov", "start": 0, "end": 42.3 }]
    },
    {
      "id": "voice",
      "kind": "audio",
      "voice_sample": "eden.wav",
      "clips": [
        {
          "id": "s1",
          "start": 0.0,
          "end": 6.2,
          "text": "First we open the settings panel.",
          "src": "media/demo-s1.wav",
          "status": "done"
        },
        { "id": "s2", "start": 6.2, "end": 12.0, "text": "", "status": "draft" }
      ]
    },
    { "id": "music", "kind": "audio", "gain": 0.2, "clips": [] },
    {
      "id": "cards",
      "kind": "overlay",
      "clips": [
        { "id": "o1", "src": "media/o1-title.mov", "html": "cards/o1-title.html", "start": 0, "end": 3 },
        {
          "id": "o2",
          "src": "media/o2-lower-third.mov",
          "html": "cards/o2-lower-third.html",
          "start": 4.5,
          "end": 9,
          "x": 0.05,
          "y": 0.78,
          "width": 0.4
        }
      ]
    }
  ]
}
```

- Times are seconds. `src` is relative to the working directory; media and clip audio live in
  `media/` so the project folder is self-contained and the pool shows every clip.
- `resolution` (`"WxH"`, default `1920x1080`) is the export frame the user picks on the timeline:
  the recording is scaled to fit and padded into it. Keep it as is. Export writes `export/<output>`.
- `offset` (optional, seconds) is where a clip starts inside its `src` file; the desktop sets it when
  the user trims a clip's head on the timeline. Keep it as is and never add it yourself.
- `status: "draft"` means the clip needs (re)synthesis. Only touch draft clips; never regenerate a
  `done` clip the user did not ask about. Keep clip `id`s stable.
- A draft clip with non-empty `text` was written by the user: keep the text verbatim. Empty text
  means "suggest something for this range".
- Tracks are `video`, `audio` or `overlay` (the older `voice` kind still loads as `audio`). On an audio track,
  a clip with `text` is spoken: you synthesize it. A clip with only `src` (music, SFX, a file the
  user dropped on the lane) is a plain file: never touch, move or regenerate it. The desktop's
  export mixes every audio clip with its track `gain`. Put spoken clips on the audio track that
  already holds speech, or add one with `id: "voice"`; never invent plain-file clips.
- `source_audio` says what to do with the recording's own audio track: `transcribe` (reuse the
  user's own speech as the script and as the voice sample, then replace it), `mute` (drop
  it), or `keep` (mix it under the voice). Missing means: `transcribe` when the recording has
  speech, else `mute`; write the choice back so the desktop shows it.

## Steps

1. **Probe.** `ffmpeg -hide_banner -i <video>` (it exits with an error without an output file; read
   stderr). The `Duration: HH:MM:SS.ms` line gives `duration` in seconds; a `Stream ... Audio:` line
   means the recording has sound.
2. **Keyframes.** Prefer scene changes; fall back to fixed sampling on static screens:

   ```sh
   mkdir -p frames
   ffmpeg -hide_banner -i <video> -vf "select='gt(scene,0.3)',showinfo,scale=640:-1" -fps_mode vfr frames/%03d.jpg 2> frames/showinfo.log
   grep -o 'pts_time:[0-9.]*' frames/showinfo.log
   ```

   The n-th `pts_time` is the timestamp of `frames/<n>.jpg`. Cap at about 40 frames: raise the
   threshold (0.4, 0.5) if there are more, or if there are fewer than 4 use
   `-vf "fps=1/5,scale=640:-1"` (one frame every 5 s) instead.

3. **Describe.** Call `ImageDecode` on every frame with the prompt
   "One sentence: what is the user doing on screen right now?" If you can see images, the frame
   itself comes back attached: describe it yourself in one sentence. Otherwise use the text
   description the tool returns. Keep the answers with their timestamps. Never open frames in a
   browser or guess their content.
   With `source_audio: transcribe`, also run the Source audio steps below; the transcript is the
   primary script and the frame descriptions only fill gaps.
4. **Plan.** Group consecutive frames that describe the same activity into segments. Each segment
   becomes a voice clip: `start` = first frame time, `end` = next segment's start (last one ends
   at `duration`). Write short, spoken-style text sized to the slot: about 2.5 words per second, so a
   6 s slot gets at most 15 words. Merge any existing draft clips from the user by their time range.
   Write `<stem>.timeline.json` with all voice clips `status: "draft"`.
5. **Synthesize.** For every draft clip:
   `TextToSpeech { text, voice_sample: "voice.wav", output_path: "<stem>-<id>.wav" }`.
   The tool reports the wav path (under `~/.infer/tts/`) and its duration. If the duration exceeds
   `end - start`, shorten the text and synthesize once more. Copy the wav into the project:
   `mkdir -p media && cp "<reported path>" "media/<stem>-<id>.wav"`, set `src` to
   `media/<stem>-<id>.wav` and `status: "done"`. Write the JSON after each clip so the desktop can
   show progress.
6. **Stop here.** Do not mux, render or export anything, and do not run ffmpeg on the output:
   the user reviews the clips on the timeline and presses Export, which renders the video
   deterministically from the JSON. Tell the user how many clips you placed, that every clip can be
   edited on the timeline, and that "redo the draft clips" regenerates only the edited ones.

## Source audio (re-voicing a spoken recording)

When `source_audio` is `transcribe`, or it is unset and the probe showed an `Audio:` stream:

1. Extract: `ffmpeg -y -i <video> -vn -ac 1 -ar 16000 audio.wav`.
2. Transcribe with timestamps: `~/.infer/bin/tools/whisper-cli -m ~/.infer/models/whisper/ggml-tiny.bin -f audio.wav -oj -of transcript`
   writes `transcript.json` with `transcription[].timestamps` / `offsets` (ms) and `text`. Use the
   largest ggml model present. If the transcript is empty or only noise, fall back to `mute` and
   say so; do not try to boost, filter or split the audio and transcribe again.
3. Segments: merge transcript lines into clips of one thought each (roughly 4-12 s), `start`/`end`
   from the offsets. Rewrite every clip's text into clean, simple spoken text: drop filler words, false
   starts and repetitions, fix grammar, keep the meaning, the order and the timing budget
   (2.5 words per second). Do not add facts the user did not say.
4. Voice sample: unless a library sample was chosen, cut the cleanest 15-25 s stretch of
   continuous speech: `ffmpeg -y -i audio.wav -ss <start> -t <len> voice.wav`.
5. Continue with Synthesize, then stop; the export replaces the original track.

## Redo drafts

When asked to redo or regenerate: read the JSON, run step 5 for `draft` clips only, then stop as in
step 6. Never touch `done` clips the user did not edit. When asked for one clip by id, the desktop
has already marked that clip `draft` with the user's edited text: synthesize exactly that clip with
that text, keep its `id`, `start` and `end`, and leave everything else alone.

## Overlay cards

A card is an HTML composition rendered by HyperFrames to a `.mov` with alpha and placed as a clip on
an `overlay` track; the desktop shows it over the video in the preview and composites it into the
export. `/hyperframes` (and its `motion-graphics` workflow) own how a composition is written; this
section owns where it goes.

Never install or set anything up: no `npm install`, `brew`, `hyperframes init` or
`hyperframes browser ensure`. Check, and stop at the first missing piece, naming it: the `hyperframes`
skill is installed at `~/.infer/skills/hyperframes/SKILL.md` (`infer skills install hyperframes motion-graphics`
or Settings > Skills); `node --version` is v22 or newer; `ffmpeg -hide_banner -filters | grep -c ' overlay '`
prints `1`. If a render fails because HyperFrames or its browser is missing, tell the user to run
`npx hyperframes browser ensure` once in a terminal; do not run it for them.

- Overlay clips: `src` is the rendered card under `media/`, `html` the composition under `cards/` it
  came from (keep both so a card can be re-rendered instead of rewritten), `start`/`end` on the
  video, and optional `x`, `y`, `width`, `height` as fractions (0-1) of the export frame, top-left
  origin; `width` alone keeps the aspect ratio, none means full frame width. Never put anything else
  on an overlay track. Use one track `id: "cards"` unless cards overlap in time; clips on one track
  must not overlap; keep ids stable and read the file back before changing it, the user moves and
  trims cards on the timeline.
- Frame: the export is `resolution` (`1920x1080` by default, `1080x1920` or `1350x1350`; the user
  picks it, never change it). A full-frame card is a composition of exactly that size; a smaller
  card keeps the same pixel density (a 1920-wide frame with `width: 0.4` is a 768 px wide card).
  The composition's duration is `end - start`.
- Write `cards/<id>-<kind>.html` (`mkdir -p cards media`). Cards that animate with CSS only carry
  `data-no-timeline` on the root so the renderer does not wait for a GSAP timeline. No files outside
  the working directory, no network fonts.
- Render: `npx --yes hyperframes render -c cards/<id>-<kind>.html --format mov -o media/<id>-<kind>.mov --quiet`.
  Always `mov` (ProRes 4444): the desktop's preview drops the alpha of a WebM, and mp4 has none.
  Check the duration with `ffmpeg -hide_banner -i media/<id>-<kind>.mov`; render again after fixing
  the HTML if it is off. Keep cards under 10 s, ProRes is large.
- Place the clip on the overlay track (create the track if missing), write the timeline, and stop as
  in step 6: no ffmpeg on the video, no export. To change a card, edit the file named by its `html`,
  render to the same `src`, leave `start`/`end` alone unless asked; placement changes need no render.

## Notes

- Never use `open` or play audio yourself; the desktop renders media inline.
- Remove `frames/` with `rm -r frames` at the end unless the user wants the stills; leave the other
  scratch files in place.
- Voice quality depends on the sample: one speaker, no background noise, no music.
