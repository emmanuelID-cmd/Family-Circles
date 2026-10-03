export function parseAccountSearch(query, circles) {
  const terms = query.split(",").map((term) => term.trim()).filter(Boolean);
  const circleTerms = terms.filter((term) => /^@circle:/i.test(term)).map((term) => term.slice(term.indexOf(":") + 1).trim().toLowerCase());
  const personTerms = terms.filter((term) => !/^@circle:/i.test(term));
  const circleIds = circles.filter((circle) => circleTerms.includes(circle.name.trim().toLowerCase())).map((circle) => circle.id);
  return { personTerms, circleIds, hasCircleTerms: circleTerms.length > 0 };
}
