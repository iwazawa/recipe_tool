const BULLET_PATTERN = /^[・\-*•●○\s　]+/;
const SPLIT_PATTERN = /[…‥⋯︙:：]/;
const PAREN_PATTERN = /（[^）]+）|\([^)]*\)/g;
const OPTIONAL_AMOUNT_KEYWORDS = ["適量", "お好み", "たっぷり", "好きなだけ", "適宜", "少々"];

function sanitizeLine(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(BULLET_PATTERN, "")
    .trim();
}

function extractParentheticalNotes(text: string) {
  const matches = text.match(PAREN_PATTERN) ?? [];
  const notes = matches.map((match) => match.slice(1, -1).trim()).filter(Boolean);
  const cleaned = text.replace(PAREN_PATTERN, "").trim();
  return { cleaned, notes };
}

function parseQuantityToken(token: string): number | null {
  const normalized = token.replace(/\s+/g, "");

  if (/^\d+$/u.test(normalized)) {
    return Number(normalized);
  }

  if (/^\d+\.\d+$/u.test(normalized)) {
    return Number(normalized);
  }

  if (/^\d+\/\d+$/u.test(normalized)) {
    const [num, denom] = normalized.split("/").map(Number);
    if (denom) {
      return num / denom;
    }
    return Number(num);
  }

  const mixedFraction = normalized.match(/^(\d+)(\d+\/\d+)$/);
  if (mixedFraction) {
    const whole = Number(mixedFraction[1]);
    const [num, denom] = mixedFraction[2].split("/").map(Number);
    if (denom) {
      return whole + num / denom;
    }
    return whole;
  }

  return null;
}

function splitQuantityAndUnit(rest: string) {
  const quantityMatch = rest.match(/^([0-9]+(?:\.[0-9]+)?|[0-9]+\/[0-9]+|[0-9]+\s+[0-9]+\/[0-9]+)/);
  if (quantityMatch) {
    const quantityToken = quantityMatch[0];
    const amount = parseQuantityToken(quantityToken.replace(/\s+/g, ""));
    const remainder = rest.slice(quantityMatch[0].length).trim();

    if (amount !== null) {
      return { amount, unit: remainder || null };
    }
  }

  const numericPrefix = rest.match(/^([0-9]+(?:\.[0-9]+)?)/);
  if (numericPrefix) {
    const amount = parseFloat(numericPrefix[0]);
    const unit = rest.slice(numericPrefix[0].length).trim();
    return { amount, unit: unit || null };
  }

  return { amount: null, unit: rest || null };
}

export type ParsedIngredient = {
  name: string;
  amount?: string;
  unit?: string;
  note?: string;
};

export function parseIngredientsFromText(text: string): ParsedIngredient[] {
  const lines = text.split(/\r?\n/);
  const results: ParsedIngredient[] = [];

  for (const rawLine of lines) {
    const sanitized = sanitizeLine(rawLine);
    if (!sanitized) continue;

    const { cleaned: lineWithoutParen, notes: parenNotes } = extractParentheticalNotes(sanitized);

    const [namePartRaw, restRaw] = lineWithoutParen.split(SPLIT_PATTERN, 2);
    const namePart = namePartRaw?.trim();
    if (!namePart) continue;

    const notes: string[] = [...parenNotes];
    let amount: number | null = null;
    let unit: string | null = null;

    if (restRaw) {
      const rest = restRaw.trim();
      const keyword = OPTIONAL_AMOUNT_KEYWORDS.find((key) => rest.includes(key));
      if (keyword) {
        notes.push(rest);
      } else {
        const { cleaned: restWithoutParen, notes: restNotes } = extractParentheticalNotes(rest);
        if (restNotes.length) {
          notes.push(...restNotes);
        }
        const quantityResult = splitQuantityAndUnit(restWithoutParen);
        amount = quantityResult.amount;
        unit = quantityResult.unit;
        if (!quantityResult.amount && !quantityResult.unit && restWithoutParen) {
          notes.push(restWithoutParen);
        }
      }
    }

    results.push({
      name: namePart,
      amount: amount != null ? String(amount) : undefined,
      unit: unit || undefined,
      note: notes.length ? notes.join(" / ") : undefined,
    });
  }

  return results;
}
