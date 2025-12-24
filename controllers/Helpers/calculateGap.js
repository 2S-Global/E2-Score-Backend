import UserEducation from "../../models/userEducationModel.js";

const normalizeLevel = (level) => {
  const lvl = Number(level);
  return lvl === 5 ? 4 : lvl; // Level 4 & 5 same
};

const getStoredYear = (record) => {
  const level = Number(record.level);

  if (level === 1 || level === 2) {
    return record.year_of_passing ? Number(record.year_of_passing) : null;
  }

  if ([3, 4, 5].includes(level)) {
    return record.duration?.from ? Number(record.duration.from) : null;
  }

  return null;
};

export const calculateEducationGapPenalty = async (userId) => {
  const records = await UserEducation.find({
    userId,
    isDel: false,
  }).lean();

  console.log("\n📥 RAW RECORDS");
  records.forEach((r) =>
    console.log({
      level: r.level,
      yop: r.year_of_passing,
      from: r.duration?.from,
      to: r.duration?.to,
    })
  );

  // Only levels 1–5
  const filtered = records.filter((r) =>
    [1, 2, 3, 4, 5].includes(Number(r.level))
  );

  console.log("\n🔍 FILTERED LEVELS (1–5)");
  filtered.forEach((r) => console.log(`Level ${r.level}`));

  // Normalize levels
  const normalized = filtered.map((r) => ({
    ...r,
    normLevel: normalizeLevel(r.level),
  }));

  console.log("\n🔁 NORMALIZED LEVELS");
  normalized.forEach((r) =>
    console.log(`Level ${r.level} → NormLevel ${r.normLevel}`)
  );

  const levelMap = new Map();

  for (const rec of normalized) {
    const year = getStoredYear(rec);

    console.log("\n🧪 STORE YEAR CHECK", {
      level: rec.level,
      normLevel: rec.normLevel,
      storedYear: year,
    });

    if (!year) {
      console.log("⛔ Skipped (no year)");
      continue;
    }

    if (!levelMap.has(rec.normLevel)) {
      levelMap.set(rec.normLevel, { ...rec, year });
    } else {
      const existing = levelMap.get(rec.normLevel);
      if (year < existing.year) {
        levelMap.set(rec.normLevel, { ...rec, year });
      }
    }
  }

  const sorted = Array.from(levelMap.values()).sort(
    (a, b) => a.normLevel - b.normLevel
  );

  console.log("\n📊 FINAL SORTED LEVELS");
  sorted.forEach((r) =>
    console.log({
      level: r.level,
      normLevel: r.normLevel,
      yearStored: r.year,
      from: r.duration?.from,
      to: r.duration?.to,
    })
  );

  let gapCount = 0;

  console.log("\n🧮 GAP CALCULATION");

  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];

    // CURRENT level END year
    const currYear =
      Number(curr.level) === 3
        ? Number(curr.duration?.to ?? curr.duration?.from)
        : curr.year;

    // NEXT level START year
    const nextYear =
      Number(next.level) >= 3 ? Number(next.duration?.from) : next.year;

    console.log("\n➡️ CHECK TRANSITION", {
      fromLevel: curr.level,
      toLevel: next.level,
      fromNorm: curr.normLevel,
      toNorm: next.normLevel,
      currYear,
      nextYear,
    });

    if (!currYear || !nextYear) {
      console.log("⛔ Skipped (missing year)");
      continue;
    }

    const rawGap = nextYear - currYear;
    let isGap = false;

    // 🔒 EXPLICIT RULES
    if (Number(curr.level) === 1 && Number(next.level) === 2) {
      console.log("Rule: Level 1 → 2 (allow 2 years)");
      isGap = rawGap > 2;
    } else if (Number(curr.level) === 2 && Number(next.level) === 3) {
      console.log("Rule: Level 2 → 3 (NO buffer)");
      isGap = rawGap > 0;
    } else if (Number(curr.level) === 3 && next.normLevel === 4) {
      console.log("Rule: Level 3 → 4/5 (NO buffer)");
      isGap = rawGap > 0;
    } else {
      console.log("Rule: Default (2-year buffer)");
      isGap = rawGap > 2;
    }

    console.log(`RawGap=${rawGap}`, isGap ? "❌ GAP COUNTED" : "✅ NO GAP");

    if (isGap) gapCount++;
  }

  console.log("\n✅ FINAL RESULT");
  console.log({
    gapCount,
    gapPenalty: gapCount * 2,
  });

  return {
    gapCount,
    gapPenalty: gapCount * 2,
  };
};
