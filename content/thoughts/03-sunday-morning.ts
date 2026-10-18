import type { Thought, ThoughtBlock, ThoughtScene } from './types'

/**
 * The canonical Sunday Morning story. The Reader blocks and future scene
 * order are both derived from these sections so the prose has one source.
 */
const sections = [
  {
    "id": "sunday-morning",
    "heading": "Sunday Morning",
    "paragraphs": [
      "The sun came up over the buildings opposite and laid a long block of warm light across Marcus's living room. It caught the edge of the sofa, the legs of the coffee table, the leaves of the plant by the window, and finally the rug.",
      "The rug was new. Marcus had spent two weeks choosing it and more money than he had meant to. He had looked at dozens online, ordered samples, held them against the floorboards at different hours of the day. When this one finally arrived, he rolled it out himself and stood over it for a while with his hands on his hips. Every morning since, he had walked across it barefoot on his way to the kitchen and felt a small, private pleasure.",
      "Today he made eggs. Slowly, low heat, taking the pan off before they looked done, the way he had finally learned. There were strawberries in a white bowl beside him, washed and halved.",
      "He had started doing that after Lisbon. One morning there, he had been sitting alone in a café when a plate arrived at the next table with strawberries beside two pieces of toast. Nothing remarkable about it. But he remembered looking at them and thinking:",
      "*People live like this.*",
      "For years, Marcus had somehow believed there were people who knew how to live and people who simply got through the day. People who bought flowers for themselves. People who travelled alone. People who owned things because they liked them, not because they had been on sale. People who cut strawberries in half on a Sunday morning.",
      "Now, apparently, he was one of them.",
      "On the wall beside the front door was a board he had put up in March. A tram pass from Prague. A paper wristband from a club in Berlin. A photograph of a table by the sea. A postcard from Sintra that he had bought and never sent, the Atlantic stretched out beneath a white cliff.",
      "He had spent nearly two hours arranging it all. Measuring the spaces. Moving things half an inch. Stepping back. Moving them again.",
      "No one had been coming over. No one would have noticed if it had been crooked.",
      "That had been the point.",
      "Marcus carried his breakfast to the table. From where he sat, if he leaned slightly toward the window, he could see the building he used to live in. It stood across the road, just above a shuttered bank.",
      "Third floor. Second window from the left.",
      "He had lived there for three years. Water came through the ceiling in two places. The kitchen window never shut properly, and in winter he pushed an old towel into the gap to stop the cold air coming in. There were roaches behind the skirting boards and a patch of damp above the bed that kept returning no matter how many times the landlord sent someone to paint over it.",
      "For three years Marcus had said he was going to leave. When work settled down. When he had saved a little more. When things were less complicated.",
      "Then one Tuesday morning, for no dramatic reason at all, he called three estate agents. A month later, he hired a van. The move took four hours.",
      "His new apartment was barely forty metres from the old one. That amused him sometimes. For three years, another life had been waiting on the other side of the road.",
      "After that came other things. Running in the mornings. Buying the stupid rug. Calling people back. Leaving parties when he wanted to leave.",
      "None of it had happened to him. He had done it.",
      "That was the part he still wasn't used to.",
      "Marcus poured coffee and went to the window. The street below was doing its Sunday things. A fruit seller was setting wooden crates outside the grocer. Two boys moved slowly past on bicycles. A woman stood in the middle of the pavement negotiating with a dog that had apparently decided the walk was over.",
      "And outside the shuttered bank, directly beneath Marcus's old kitchen window, there was a man shouting into a phone."
    ]
  },
  {
    "id": "across-the-street",
    "heading": "Across the Street",
    "paragraphs": [
      "Marcus watched him.",
      "The man wore a long dark coat despite the warmth. One hand held the phone to his ear. The other cut sharply through the air. He kept walking three steps one way and three steps back, never leaving the small patch of pavement in front of the bank.",
      "There was something about the way he moved. The shoulders raised too high. The jaw held tight. The sense that whatever had happened had already happened, but his body had not yet been told.",
      "Marcus knew that posture. He had stood like that outside pubs, at bus stops, in the old kitchen at two in the morning. Explaining. Defending. Rehearsing arguments before they happened and continuing them long after they were over.",
      "He looked past the man to the window above him. His old window.",
      "For a second Marcus could see himself standing behind it. Not clearly. Just the shape of someone awake too late.",
      "Then the feeling passed.",
      "He looked around his apartment. The sunlight. The table. The bowl of strawberries. The board by the door. The rug beneath his feet. Everything was exactly where he had put it.",
      "And yet, for one strange second, none of it looked secure.",
      "The thought came quietly.",
      "*What if I ruin all of this?*",
      "His hand jerked. The mug slipped. It struck the floor, rolled once, and emptied itself across the rug.",
      "Marcus stared. The coffee spread quickly through the wool. He set the mug upright, but there was nothing left in it.",
      "Below, the fruit seller glanced up at the sound. The boy on the bicycle followed his gaze.",
      "Marcus stepped back from the glass. Four floors up, behind a window, standing over the thing he had ruined — and certain, for a moment, that all of it was visible from the street.",
      "Across the road, the man lowered his phone. He looked directly at Marcus.",
      "Then he started walking toward the building."
    ]
  },
  {
    "id": "the-knock",
    "heading": "The Knock",
    "paragraphs": [
      "The knock came before Marcus had decided what to do about the stain. Two heavy blows against the door.",
      "He stood still. There was another knock.",
      "Marcus opened it.",
      "The man from the street walked past him without being invited in. Not aggressively. Almost familiarly, as though he had been there before.",
      "Up close, there was nothing remarkable about him. He looked roughly Marcus's age. Tired eyes. A day's growth along his jaw. The coat was worn at the cuffs and slightly too large for him.",
      "He stopped when he saw the rug. For a moment he said nothing. Then he looked at Marcus.",
      "\"Look what you did.\"",
      "Marcus glanced down. \"It's coffee.\"",
      "The man gave a short laugh. \"Of course it is.\"",
      "\"I can clean it.\"",
      "\"Right.\"",
      "He walked farther into the apartment. Marcus watched him take in the room. The sofa. The lamp. The plant by the window. Breakfast on the table.",
      "The man's eyes moved to the board beside the door. \"What's this?\"",
      "Marcus didn't answer.",
      "The man stepped closer. He touched the postcard from Sintra with one finger. \"Two hours.\"",
      "Marcus felt something tighten inside him. \"What?\"",
      "\"You spent two hours doing this.\"",
      "The postcard looked slightly duller than it had a moment ago.",
      "Marcus frowned. \"How do you know that?\"",
      "\"You measured the gaps.\" The man looked at him. \"Spirit level and everything.\"",
      "Marcus said nothing.",
      "The man turned back to the board. \"A tram ticket. A postcard. A receipt from a bar.\" His finger moved slowly across the wall. \"Look at Marcus.\"",
      "Something hot moved up Marcus's neck. \"Don't touch it.\"",
      "The man pulled his hand away.",
      "For the first time since putting the board up, Marcus felt embarrassed by it. The ticket stubs. The photographs. The postcard he had bought himself. Evidence arranged neatly on a wall.",
      "*Look where I've been. Look who I am now.*",
      "Behind him, the man said quietly, \"There you are.\"",
      "Marcus turned. \"What?\"",
      "\"There you are.\"",
      "Marcus looked down. He had picked up a dishcloth. He hadn't noticed doing it."
    ]
  },
  {
    "id": "the-stain",
    "heading": "The Stain",
    "paragraphs": [
      "Marcus crouched beside the rug and pressed the cloth into the coffee. Brown lifted into the fabric.",
      "\"There,\" he said.",
      "He rubbed harder. The stain spread.",
      "\"No.\" He folded the cloth and tried again. The coffee moved farther through the fibres.",
      "\"Stop.\"",
      "\"I can get it out.\"",
      "The man stood above him. \"Marcus.\"",
      "He scrubbed. \"I said I can get it out.\"",
      "\"Look at you.\"",
      "Marcus stopped. The man's voice had changed. Not louder. Closer.",
      "\"On your knees on a Sunday morning because you spilled a cup of coffee.\"",
      "Marcus looked up.",
      "Behind the man, through the open front door, the hallway was wrong. The walls were beige. Not the soft white of his building — a flat, dead beige. There was a water stain on the ceiling, and Marcus knew its shape before he knew what he was looking at. A wide brown mark, almost like a hand.",
      "Then came the smell. Damp plaster. Old smoke from downstairs. Fabric that never quite dried in winter.",
      "His stomach turned.",
      "Marcus stood. For a moment, his apartment looked unfamiliar. The rug seemed cheaper than he remembered. The room smaller. The board by the door childish. The eggs on the table had gone cold.",
      "Of course.",
      "There it was.",
      "Marcus looked down at the cloth in his hand. \"I'll fix it.\"",
      "The man didn't answer.",
      "Marcus crouched again. \"I can fix it.\"",
      "\"Stop.\"",
      "\"I'm sorry.\"",
      "\"Don't.\"",
      "The word came hard enough to stop his hand.",
      "Marcus looked up. The man wasn't angry anymore. Or not only angry. Something else had moved into his face, something Marcus recognised much less easily.",
      "\"Don't apologise to me.\"",
      "The man was breathing heavily. For a moment neither of them spoke. Then he said, \"Three years.\"",
      "Marcus stayed still.",
      "\"Three years I kept us alive in that place.\" He pointed toward the hallway. \"When nobody called back. When there was nothing in the account. When the ceiling came in over the bed and we slept on the floor because we couldn't afford anywhere else.\"",
      "Marcus loosened his grip on the cloth.",
      "\"I got us through every week.\" The man looked toward the old building through the window. \"I knew how to live there.\" His voice had gone quieter. \"I knew which sound in the wall meant water and which one was pipes.\"",
      "He looked around the apartment.",
      "\"Then you just left.\""
    ]
  },
  {
    "id": "the-phone",
    "heading": "The Phone",
    "paragraphs": [
      "Marcus stood slowly.",
      "The man's voice thinned. \"You packed a van and walked out.\"",
      "Something inside Marcus went quiet.",
      "\"You didn't take anything of mine.\"",
      "Marcus stared at him. Then he noticed the phone. The man was still holding it.",
      "Marcus looked at the black screen. \"Who were you talking to?\"",
      "The man looked at him. \"What?\"",
      "\"Outside.\"",
      "No answer.",
      "\"You were shouting at someone.\"",
      "The man glanced down at the phone. The screen stayed dark. No call. No name. Nothing.",
      "\"There's nobody there,\" Marcus said.",
      "The man closed his hand around the phone. \"You don't know what you're talking about.\"",
      "\"Who were you talking to?\"",
      "\"Leave it.\"",
      "Marcus looked at him. At the raised shoulders. At the coat hanging too heavily from them. At the hand gripping a silent phone.",
      "And something shifted.",
      "The man suddenly looked smaller. Not harmless. Not yet. Just tired in a way Marcus had not noticed before.",
      "Marcus looked at the hallway behind him. Then through the window at the old apartment. Then back at the man.",
      "\"You don't know what to do when nothing's wrong.\"",
      "The man flinched. Only slightly. But Marcus saw it.",
      "The room became very still."
    ]
  },
  {
    "id": "three-years",
    "heading": "Three Years",
    "paragraphs": [
      "The man looked away. His eyes landed on the breakfast table. The strawberries. He stared at them for a while.",
      "\"Look at you,\" he said. There was no mockery in it now. Not really. \"Strawberries in a bowl.\"",
      "Marcus almost smiled.",
      "The man shook his head. \"Lisbon.\" He glanced at the board. \"Prague.\" Then the rug. \"This.\"",
      "Marcus waited.",
      "\"You think you're better than me.\"",
      "\"No.\"",
      "\"You are.\"",
      "\"No.\"",
      "The man looked at him. \"You don't need me.\"",
      "Marcus didn't answer quickly enough.",
      "The man laughed once. There was no anger left in it. \"You'd be nothing without me.\"",
      "Marcus looked at him. \"You're right.\"",
      "The man went still.",
      "Marcus stepped closer. \"You kept us alive.\"",
      "The man's face tightened.",
      "\"I mean it.\"",
      "Marcus looked past him, through the window. Across the road, the old kitchen sat above the shuttered bank. For years he had hated that room. Now, looking at it, he remembered other things too.",
      "Eating cereal over the sink because there were no clean bowls. Laughing alone at three in the morning because the neighbour's ceiling had started leaking before his own for once. Getting the email that gave him his first decent job. Sleeping on the floor beneath a saucepan catching rain. Calling his mother and telling her everything was fine.",
      "Someone had lived through it.",
      "The man followed Marcus's eyes to the old window. Neither of them spoke.",
      "Finally Marcus said, \"You got us out.\"",
      "The man looked at him. \"What?\"",
      "\"You got us here.\"",
      "The man turned slowly back toward the apartment. The sunlight had reached almost all the way across the rug now. His face changed. Only a little. But enough.",
      "\"So what am I for now?\"",
      "The question was so quiet Marcus nearly missed it.",
      "He looked at the man properly. At the coat. At the tired eyes. At the hand still wrapped around the phone.",
      "And for the first time, Marcus understood why he had come upstairs. He hadn't come to take the apartment away. He had nowhere else to go.",
      "Marcus crossed the space between them. The man's shoulders rose, almost like he expected to be hit.",
      "Marcus put a hand on his shoulder. The coat was warm. Underneath it, the man was shaking.",
      "Marcus held on. \"You got us here,\" he said again.",
      "The man looked at him.",
      "\"You can rest.\"",
      "For a second nothing happened. Then the man's face folded. Not dramatically — it simply stopped holding itself together. His eyes shut. His shoulders dropped. And a long breath came out of him, the kind that comes at the end of a day. Or the end of something much longer."
    ]
  },
  {
    "id": "the-window",
    "heading": "The Window",
    "paragraphs": [
      "They stood like that for a while. Marcus did not know how long.",
      "The man opened his eyes. He looked younger. Not seventeen exactly, but young enough that Marcus wondered how he had missed it.",
      "\"What if you go back?\"",
      "Marcus looked at the stain. He thought about saying he wouldn't. He wanted to.",
      "Instead he said, \"Maybe I will.\"",
      "The man stared at him.",
      "\"For a day. For a week. I don't know.\" Marcus looked across the street. The old window waited. \"But going back doesn't mean I have to live there again.\"",
      "The man looked down. Marcus's hand was still on his shoulder.",
      "Sunlight moved across the room and touched the edge of the coat. For a moment, dust turned in the beam.",
      "Then Marcus realised it wasn't dust.",
      "The fabric beneath his hand had started to loosen. Not tear. Loosen. Into something fine and bright.",
      "The man looked at his shoulder. Then at Marcus. Neither of them seemed surprised.",
      "His sleeve went next. Then his hand. The coat became a cloud of tiny pieces that lifted slowly into the sunlight.",
      "Marcus kept hold of him for as long as there was something to hold.",
      "The man's face went last. The tired eyes. The jaw. The expression he had been carrying for years. Just before it disappeared, he looked almost relieved.",
      "The phone slipped from his hand. It hit the floor without making a sound.",
      "Then it was gone too."
    ]
  },
  {
    "id": "after",
    "heading": "After",
    "paragraphs": [
      "The hallway was white again. Marcus stood alone in the apartment. The strawberries were red. The postcard showed a blue sea. The room smelled like coffee and eggs.",
      "He looked down at the rug. The stain was still there. Brown, uneven, about the size of a saucer.",
      "Marcus crouched beside it. There were things you could buy for wool. He knew that. Sprays. Powders. Something with a little brush on the end. He could probably get most of it out.",
      "He stood. Went into the kitchen. Rinsed the mug. Poured another coffee. Then he returned to the window.",
      "The street had gone back to itself. The fruit seller was arguing with an old woman over the price of oranges. The boys on bicycles were gone. The dog had won and was pulling its owner home.",
      "Across the road, outside the shuttered bank, the pavement was empty. Above it, the old kitchen window caught the sun.",
      "Marcus drank his coffee.",
      "He knew the man would come back. Not tomorrow, necessarily. Maybe not for months. But some morning the room would feel smaller. Someone wouldn't call back. Money would get tight. Something he cared about would fail. A cup would fall.",
      "And Marcus would look across the street and see the coat again. Pacing beneath the old window. Looking for someone to fight.",
      "Next time, Marcus thought, he would go downstairs. He would sit beside him. Maybe say nothing.",
      "There was nothing to defeat.",
      "Marcus turned from the window. The light had moved farther across the room. It reached the place where the coffee had dried.",
      "He looked at the faint brown ring in the wool.",
      "Then he left it there.",
      "So the man would know where to find him."
    ]
  }
] as const

export type SundayMorningSceneId = (typeof sections)[number]['id']

/** Ordered from the canonical article sections. */
export const SUNDAY_MORNING_SCENE_IDS: readonly SundayMorningSceneId[] = sections.map(({ id }) => id)

/** The first three chapters have authored presentation; later themes are placeholders. */
const sceneIntent: Record<SundayMorningSceneId, Omit<ThoughtScene, 'id'>> = {
  'sunday-morning': {
    theme: 'warm', visual: 'sunday-morning-photo',
    mood: { name: 'morning', background: '#eee5d6', text: '#302b23', shadow: '#665b45', exposure: 1, contrast: 1, light: 1, vignette: .015, grain: .025 },
    layout: { focus: 'room', density: 'open' },
    beats: [
      { id: 'people-live', match: '*People live like this.*', breathingRoom: true },
      { id: 'deliberate-life', match: 'None of it had happened to him. He had done it.', breathingRoom: true },
    ],
  },
  'across-the-street': {
    theme: 'cool', visual: 'across-the-street-photo', intro: true,
    mood: { name: 'recognition', background: '#8b776a', text: '#2f2823', shadow: '#362821', exposure: .87, contrast: 1.16, light: .34, vignette: .19, grain: .052 },
    layout: { focus: 'window', density: 'normal', inlineVisual: true },
    beats: [
      { id: 'old-window', match: 'His old window.', cues: { recognition: 1 } },
      { id: 'hinge', match: '*What if I ruin all of this?*', breathingRoom: true,
        mood: { background: '#817064', light: .28, exposure: .84, contrast: 1.18, vignette: .22 }, cues: { still: 1 } },
      { id: 'mug-drop', match: 'His hand jerked. The mug slipped.',
        mood: { background: '#75665d', light: .18, exposure: .79, contrast: 1.22, vignette: .26 }, cues: { spill: 1 } },
      { id: 'exposure', match: 'Below, the fruit seller glanced up', cues: { exposure: 1 } },
      { id: 'approach', match: 'He looked directly at Marcus.', cues: { approach: 1 } },
    ],
  },
  'the-knock': {
    theme: 'dim', visual: 'apartment', intro: true,
    mood: { name: 'intrusion', background: '#665b55', text: '#27211e', shadow: '#2c211d', exposure: .72, contrast: 1.27, light: .12, vignette: .3, grain: .06 },
    layout: { focus: 'room', density: 'tight', inlineVisual: true },
    beats: [
      { id: 'two-hours', match: 'He touched the postcard from Sintra with one finger. "Two hours."',
        mood: { background: '#5e544f', exposure: .69, contrast: 1.29, light: .1, vignette: .32 }, cues: { knowledge: 1, still: 1 } },
      { id: 'shame', match: 'For the first time since putting the board up, Marcus felt embarrassed by it.',
        mood: { background: '#574e49', exposure: .66, contrast: 1.31, light: .08, vignette: .34 }, cues: { knowledge: 1, still: 1, shame: 1 } },
      { id: 'there-you-are', match: 'Behind him, the man said quietly, "There you are."', breathingRoom: true,
        mood: { background: '#504842', exposure: .63, contrast: 1.34, light: .06, vignette: .37 }, cues: { knowledge: 1, still: 1, shame: 1, rugFocus: 1 } },
    ],
  },
  'the-stain': { theme: 'muted' },
  'the-phone': { theme: 'dark' },
  'three-years': { theme: 'soft' },
  'the-window': { theme: 'warming' },
  'after': { theme: 'calm' },
}

export const SUNDAY_MORNING_SCENES: readonly ThoughtScene[] = SUNDAY_MORNING_SCENE_IDS.map((id) => ({
  id, ...sceneIntent[id], transition: 'blend',
}))

const body: ThoughtBlock[] = sections.flatMap(({ id, heading, paragraphs }) => [
  { type: 'heading', id, text: heading },
  ...paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
])

const thought: Thought = {
  slug: 'sunday-morning',
  number: '03',
  title: 'across\nthe street',
  accent: '#0e27b6',
  portal: { kind: 'house' },
  experience: { kind: 'scenes', scenes: SUNDAY_MORNING_SCENES },
  coverImage: {
    src: '/images/thoughts-midnight-notebook.jpg',
    alt: 'Moonlight falling across handwritten pages on a dark desk',
    position: 'center center',
    mobilePosition: '62% center',
  },
  body,
}

export default thought
