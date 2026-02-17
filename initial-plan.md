# Domain Model

## Exercise

- id SERIAL PRIMARY KEY
- name TEXT
- description TEXT
- fingering TEXT e.g [C4](1) [D4](2) [E4](3)
- target_tempo INT
- time_signature TEXT
- type ENUM e.g. "triad", "scale"
- instrument ENUM e.g. "piano", "guitar"

## Variation

- id SERIAL PRIMARY KEY
- for_type ENUM e.g. "triad", "scale"
- name TEXT e.g. "staccato", "long-short"
- description TEXT
- instructions TEXT

## Completion

- id SERIAL PRIMARY KEY
- start TIMESTAMP NOT NULL
- end TIMESTAMP
- actual_tempo INT
- difficulty INT e.g. 0-4
- exercise_id INT REFERENCES Exercise(id)
- session_id INT REFERENCES Session(id)

## Session

- id SERIAL PRIMARY KEY
- start TIMESTAMP NOT NULL
- end TIMESTAMP
- notes TEXT

# User Interface Screens

## Home

- A stylistic title across the top "Practice Better"
- In the middle of screen there is a button for stats and a button for settings.
- Near the bottom a CTA button that has a different text every time e.g. "Start Practicing", "Let's Go", "Time to Practice", "Get Practicing", "Start Your Session", "Begin Practicing", "Let's Get Started", "Time to get to work", "Start Your Journey", "Let's Do This", "Get Started Now", "Your Practice Awaits", "Start Practicing Now", "Let's Get Practicing", "Time to Start Practicing", "Begin Your Practice", "Get Practicing Now", "Start Your Practice Journey", "Let's Get Started Practicing", "Time to Start Your Practice"
  - Above it there is a flip flop toggle where one of two things is selected for the kind of thing you want to practice. A guitar or piano emoji.
  - Above the button and beside the toggle there is also another selection for how long to practice. Either short, long, or unlimited.

## Stats

- Page consists of a number of cards.
  - First card recounts total number of sessions, total time spent practicing, and average time per session.
  - Second card recounts daily and weekly streaks.
  - Third card lets you select an exercise and see a graph of your progress on that exercise over time. X axis is date, Y axis is tempo. Each point is a session where you practiced that exercise and the point's Y value is the tempo you practiced it at. It also shows difficulty as color of the point e.g. green is easy, yellow is medium, red is hard.
- Use shadcn charts for the graphs.

## Settings

- Just some text about how this is a fun bonus easter egg screen for now.

## Practice Session

- At the top is the name of the current exercise of the session. Below this if necessary is a variation name e.g. "staccato" or "long-short" in a badge along with a badge of the type of exercise.
- Below the name is a keyboard or fretboard graphic with the fingering as necessary.
- Below the fingering is the BPM tempo and a plus and minus button beside it that lets you slow it down or speed it up in increments.
- At the bottom of the screen is a CTA button that says "done". Clicking this ends the exercise and pops up a card that covers the screen and blurs the background where you can input how you did from couldn't do it to perfect which maps to difficulty. Then it takes you to the next exercise in the session or if there are no more exercises it ends the session and takes you back to the home screen. When an exercise is finished a completion is created where the actual tempo is recorded along with the difficulty and the end time. When the session is finished the end time of the session is also recorded.
- In the very top right there is a red x button that ends the session immediately and takes you back to the home screen.
- To the left of the x button is a mute button which would mute the metronome
- In very small text in the bottom right it says "n/3" where n is the current exercise number and 3 is the total number of exercises in the session. Total would be 3 for short, 5 for long, and "?" for unlimited.

# Design notes:

- Make storage pluggable through an interface such that I could back it with next.js api eventually if I wanted to

# Open questions

- Do I need primary keys with indexedDB?
- How can I statically load some of the domain model from JSON files? E.g. exercises and variations. I want to be able to edit these without having to run a script to load them into the database.
- What would the storage interface look like?
