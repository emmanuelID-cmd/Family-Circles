export function validateCircleNames(rawValue, existingNames, availableSlots) {
  const names = String(rawValue).split(",").map((name) => name.trim());

  if (names.length === 1 && !names[0]) {
    return { names: [], error: "Enter at least one circle name." };
  }
  if (names.some((name) => !name)) {
    return { names: [], error: "Remove empty entries between commas." };
  }
  if (names.some((name) => name.length > 40)) {
    return { names: [], error: "Each circle name must be 40 characters or fewer." };
  }

  const normalizedNames = names.map((name) => name.toLowerCase());
  const existing = new Set(existingNames.map((name) => name.trim().toLowerCase()));
  if (new Set(normalizedNames).size !== normalizedNames.length || normalizedNames.some((name) => existing.has(name))) {
    return { names: [], error: "Circle names must be unique. Remove any names that already exist or repeat." };
  }
  if (names.length > availableSlots) {
    return {
      names: [],
      error: availableSlots > 0
        ? `You can add ${availableSlots} more circle${availableSlots === 1 ? "" : "s"} under the 10-circle limit. Remove extra names or delete a circle first.`
        : "You have reached the 10-circle limit. Delete a circle before creating another.",
    };
  }

  return { names, error: "" };
}
