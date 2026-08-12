const traitMapping = {
  openness: {
    name: "Openness (O)",
    high: {
      characteristics: "Highly curious, creative, comfortable with ambiguity and innovation.",
      roles: "R&D, Strategy, Product Design"
    },
    low: {
      characteristics: "Practical, conventional, prefers proven routines over novel experiments.",
      roles: "Operations, Compliance, SOP Execution"
    }
  },
  conscientiousness: {
    name: "Conscientiousness (C)",
    high: {
      characteristics: "Highly organized, dependable, detail-driven, high self-discipline.",
      roles: "Project Management, QA, Finance, Engineering"
    },
    low: {
      characteristics: "Flexible, spontaneous, but may struggle with strict deadlines or detail.",
      roles: "Dynamic Creative Roles, Early-Stage Ideation"
    }
  },
  extraversion: {
    name: "Extraversion (E)",
    high: {
      characteristics: "Energetic, assertive, thrives in collaborative/public settings.",
      roles: "Sales, Public Relations, Team Leadership"
    },
    low: {
      characteristics: "Reserved, reflective, works best in focused independent setups.",
      roles: "Deep Technical Research, Data Analysis"
    }
  },
  agreeableness: {
    name: "Agreeableness (A)",
    high: {
      characteristics: "Empathetic, cooperative, highly focused on team cohesion and morale.",
      roles: "Customer Success, HR, Conflict Mediation"
    },
    low: {
      characteristics: "Competitive, critical, skeptical, willing to challenge status quo.",
      roles: "Auditing, Negotiating, Critical Review"
    }
  }
};

export const getTraitInfo = (headerName, percentage) => {
  if (!headerName) {
    return {
      level: "Moderate",
      characteristics: "Stable and balanced characteristics within normal range.",
      idealRoles: "General functional roles."
    };
  }

  const name = headerName.toLowerCase();
  
  let traitKey = null;
  if (name.includes("openness") || name === "o" || name.includes("(o)")) {
    traitKey = "openness";
  } else if (name.includes("conscientiousness") || name === "c" || name.includes("(c)")) {
    traitKey = "conscientiousness";
  } else if (name.includes("extraversion") || name === "e" || name.includes("(e)")) {
    traitKey = "extraversion";
  } else if (name.includes("agreeableness") || name === "a" || name.includes("(a)")) {
    traitKey = "agreeableness";
  }

  if (!traitKey) {
    return {
      level: "Moderate",
      characteristics: "Stable and balanced characteristics within normal range.",
      idealRoles: "General functional roles."
    };
  }

  const trait = traitMapping[traitKey];
  if (percentage > 65) {
    return {
      level: "High",
      characteristics: trait.high.characteristics,
      idealRoles: trait.high.roles
    };
  } else if (percentage < 35) {
    return {
      level: "Low",
      characteristics: trait.low.characteristics,
      idealRoles: trait.low.roles
    };
  } else {
    return {
      level: "Moderate",
      characteristics: `Balanced level of ${trait.name}, exhibiting moderate characteristics.`,
      idealRoles: "Diverse functional roles requiring a balanced approach."
    };
  }
};
