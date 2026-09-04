---
name: video-editing
description: Add the user's own cloned voice to a screen recording - probe the video and pull scene keyframes with ffmpeg, describe them with ImageDecode (or write down what the user says in the recording with whisper-cli and clean it up), write a <stem>.timeline.json plan, and make the audio for each clip with TextToSpeech (voice_sample cloning). The desktop renders the export; the agent never muxes. Use when the user asks to add a voiceover, add their voice, explain a video, redo the voice on a recording, or redo clips of an existing timeline.
license: Apache-2.0
---

# Video Editing

Use this skill when the user gives you a video (usually a macOS screen recording in the working
directory, silent or with the user talking over it) and wants their voice added, or asks to redo clips of
an existing `<stem>.timeline.json`.

The desktop app renders `<stem>.timeline.json` as an editable timeline, so the file is the contract:
always read it first if it exists, always write it back after every step that changes it.

## Tools you may use

Only these, nothing else: `Bash` for `ffmpeg`, `whisper-cli`, `cp`, `mkdir`, `ls`, `grep` and `rm` (scratch
files only) inside the working directory; `Read` and `Write` for the timeline JSON; `ImageDecode`; `TextToSpeech`. Do not
use `WebFetch`, `WebSearch`, `find`, package managers, or any other binary, and do not look for
this skill, other skills or tools on disk: everything you need is listed below at fixed paths.

## Prerequisites

Everything below is installed by the desktop when a project is switched to the Content type. Do
not download, build, symlink or search the disk for tools, and do not create directories anywhere
under `~/.infer`; the only place you write is the working directory.

- `~/.infer/bin/ffmpeg` (also on `PATH`). There is no `ffprobe`; probe with `ffmpeg -i`.
- `~/.infer/bin/whisper-cli` with the model `~/.infer/models/whisper/ggml-tiny.bin` (only for
  `source_audio: transcribe`). Use a larger model only if one already exists in that directory.
- The `ImageDecode` tool (`vision.annotator.enabled` with a vision model, typically
  `ollama/qwen3-vl:2b` for a local setup) and the `TextToSpeech` tool (`text_to_speech.enabled`).
- A voice sample: a 10-30 s `.wav` of the user speaking, kept by the desktop in
  `~/.infer/models/tts/samples/`. `TextToSpeech` only accepts a bare file name inside the working
  directory, so copy the chosen sample to `./voice.wav` once. When the recording itself contains the
  user's speech (`source_audio: transcribe`), the sample can be cut from it instead (see Source
  audio).

If any of these is missing, stop and tell the user exactly which one: tools and the model are
installed by switching the project to Content in Settings > Projects; the two agent tools are
enabled in Settings > General; voice samples are recorded in Settings > Voice samples.

Scratch files (`frames/`, `audio.wav`, `voice.wav`, `transcript.json`) live in the working
directory next to the video and the timeline.

## Timeline contract (`<stem>.timeline.json`)

```json
{
  "version": 1,
  "duration": 42.3,
  "output": "demo.with-voice.mp4",
  "source_audio": "transcribe",
  "tracks": [
    {
      "id": "video",
      "kind": "video",
      "clips": [{ "id": "v1", "src": "demo.mov", "start": 0, "end": 42.3 }]
    },
    {
      "id": "voice",
      "kind": "voice",
      "voice_sample": "voice.wav",
      "clips": [
        {
          "id": "s1",
          "start": 0.0,
          "end": 6.2,
          "text": "First we open the settings panel.",
          "src": "/Users/me/.infer/tts/demo-s1.wav",
          "status": "done"
        },
        { "id": "s2", "start": 6.2, "end": 12.0, "text": "", "status": "draft" }
      ]
    },
    { "id": "music", "kind": "audio", "gain": 0.2, "clips": [] }
  ]
}
```

- Times are seconds. `src` relative = working directory, absolute = elsewhere (TTS output).
- `status: "draft"` means the clip needs (re)synthesis. Only touch draft clips; never regenerate a
  `done` clip the user did not ask about. Keep clip `id`s stable.
- A draft clip with non-empty `text` was written by the user: keep the text verbatim. Empty text
  means "suggest something for this range".
- `kind: "audio"` tracks (music, SFX) are mixed in by the desktop's export with their `gain`; never
  invent them.
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
   "One sentence: what is the user doing on screen right now?" Keep the answers with their timestamps.
   With `source_audio: transcribe`, also run the Source audio steps below; the transcript is the
   primary script and the frame descriptions only fill gaps.
4. **Plan.** Group consecutive frames that describe the same activity into segments. Each segment
   becomes a voice clip: `start` = first frame time, `end` = next segment's start (last one ends
   at `duration`). Write short, spoken-style text sized to the slot: about 2.5 words per second, so a
   6 s slot gets at most 15 words. Merge any existing draft clips from the user by their time range.
   Write `<stem>.timeline.json` with all voice clips `status: "draft"`.
5. **Synthesize.** For every draft clip:
   `TextToSpeech { text, voice_sample: "voice.wav", output_path: "<stem>-<id>.wav" }`.
   The tool reports the wav path and its duration. If the duration exceeds `end - start`, shorten the
   text and synthesize once more. Set `src` to the reported path and `status: "done"`. Write the
   JSON after each clip so the desktop can show progress.
6. **Stop here.** Do not mux, render or export anything, and do not run ffmpeg on the output:
   the user reviews the clips on the timeline and presses Export, which renders the video
   deterministically from the JSON. Tell the user how many clips you placed, that every clip can be
   edited on the timeline, and that "redo the draft clips" regenerates only the edited ones.

## Source audio (re-voicing a spoken recording)

When `source_audio` is `transcribe`, or it is unset and the probe showed an `Audio:` stream:

1. Extract: `ffmpeg -y -i <video> -vn -ac 1 -ar 16000 audio.wav`.
2. Transcribe with timestamps: `~/.infer/bin/whisper-cli -m ~/.infer/models/whisper/ggml-tiny.bin -f audio.wav -oj -of transcript`
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

## Notes

- Never use `open` or play audio yourself; the desktop renders media inline.
- Remove `frames/` with `rm -r frames` at the end unless the user wants the stills; leave the other
  scratch files in place.
- Voice quality depends on the sample: one speaker, no background noise, no music.
