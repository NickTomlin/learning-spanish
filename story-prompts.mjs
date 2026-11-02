import { createHash } from "node:crypto";

const SCENARIOS = [
  "A community theater rehearsal: a prop disappears just before the performance; someone finds an unexpected replacement.",
  "A train station: a traveler tries to return a notebook containing clues to its owner's destination.",
  "A family kitchen: two siblings repair an old clock and discover why their grandmother kept it.",
  "A coastal market: a bookseller receives a parcel meant for another stall and follows its trail.",
  "A neighborhood garden: a volunteer notices seedlings have been moved and learns who was protecting them.",
  "A mountain bus stop: passengers improvise a way to reach a festival when their bus breaks down.",
  "A museum storeroom: an archivist identifies an unlabeled portrait with help from a visitor.",
  "A veterinary clinic: an assistant reunites a lost pet with someone other than the person who brought it in.",
  "A school radio studio: students must finish a live broadcast after their guest fails to arrive.",
  "A bicycle repair shop: a mechanic finds an old photograph hidden in a donated bike.",
];

const CHILDHOOD_SCENARIOS = [
  "A childhood memory: two cousins put on a puppet show for their family, but their favorite puppet goes missing.",
  "A child learning to ride a bicycle in an apartment courtyard gets unexpected help from a neighbor.",
  "During a childhood move, a child finds a hand-drawn map hidden in a box packed by an older sibling.",
  "A child helps in a family bakery and an ordinary mistake leads to an unexpected treat.",
  "A schoolchild preparing to read aloud discovers that a friend left a secret message inside the library book.",
];

const COMPLICATIONS = [
  "A small misunderstanding changes what the protagonist thinks is happening.",
  "An ordinary object turns out to have a surprising but plausible use.",
  "Someone from the protagonist's past appears at the wrong moment.",
  "A deadline forces the group to choose between two reasonable plans.",
  "The person who seems to need help ends up helping someone else.",
];

const OPENINGS = [
  "Begin in the middle of an action, then reveal the background.",
  "Begin with a recurring habit before focusing on one unusual occasion.",
  "Begin with a surprising discovery, then show how it happened.",
  "Open with a short exchange between characters, not a description of the setting.",
  "Begin with a decision that changes an ordinary routine.",
];

const CHILDHOOD_OPENINGS = [
  "Recall something the child used to do, then focus on one particular day.",
  "Begin with a childhood object or sensory memory, then tell what happened to it.",
  "Open with dialogue between children before revealing their usual routine.",
  "Start with the memorable incident, then explain the childhood background.",
];

function pick(seed, label, choices) {
  const bytes = createHash("sha256").update(`${seed}:${label}`).digest();
  return choices[bytes.readUInt32BE(0) % choices.length];
}

export function storyIngredients(seed, theme = "any") {
  if (theme !== "any" && theme !== "childhood") throw new Error(`Unknown theme: ${theme}`);
  const childhood = theme === "childhood";
  return {
    seed,
    theme,
    scenario: pick(seed, "scenario", childhood ? CHILDHOOD_SCENARIOS : [...SCENARIOS, ...CHILDHOOD_SCENARIOS]),
    complication: pick(seed, "complication", COMPLICATIONS),
    opening: pick(seed, "opening", childhood ? CHILDHOOD_OPENINGS : OPENINGS),
  };
}
