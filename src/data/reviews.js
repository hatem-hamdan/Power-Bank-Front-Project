import { FIRST, LAST, PLACES, RV_FIVE, RV_FOUR } from "./reviewPools";

const KINDS = [
  ["Black", "2000 mAh"],
  ["White", "2000 mAh"],
  ["Black", "4000 mAh"],
  ["White", "4000 mAh"],
];

const TAIL_START = [
  " The cables stay tucked in.",
  " The flashlight came in handy.",
  " It has a spot on my keys now.",
  " I stopped carrying a loose cable.",
  " Clipped on in the morning, still there at night.",
  " It replaced the charger I used to forget.",
  " Easy to lend for a minute, then clip it back.",
  " I charge it with the same USB-C cable.",
  " Kept it on the bag, not loose in a pocket.",
  " One top-up was all I needed that day.",
];

export const REVIEW_TOTAL = 214;
export const REVIEW_START = 6;
export const REVIEW_STEP = 5;

export function buildReviews() {
  const seen = {};
  const reviews = [];

  for (let index = 0; index < REVIEW_TOTAL; index += 1) {
    const [color, capacity] = KINDS[index % KINDS.length];
    const stars = index % 5 === 4 || index === 2 ? 4 : 5;
    const pool = (stars === 4 ? RV_FOUR : RV_FIVE)[`${color}|${capacity}`];
    const place = PLACES[index % PLACES.length];
    const tails = [...TAIL_START, ` Used it ${place}.`];
    let text = pool[index % pool.length].replaceAll("{place}", place);
    let tailIndex = 0;

    while (seen[text] && tailIndex < tails.length) {
      text = `${text.replace(/\.$/, ".")}${tails[tailIndex]}`;
      tailIndex += 1;
    }

    if (seen[text]) {
      text = `${text.replace(/\.$/, "")}. Still glad I picked ${color.toLowerCase()} ${capacity}.`;
    }

    seen[text] = true;
    const first = FIRST[index % FIRST.length];
    const lastInitial = LAST[Math.floor(index / FIRST.length) % LAST.length].charAt(0);
    const name = index < REVIEW_START ? first : `${first} ${lastInitial}.`;

    reviews.push({
      name,
      letter: first.charAt(0),
      stars,
      color,
      capacity,
      text,
    });
  }

  return reviews;
}
