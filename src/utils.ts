import CryptoJS from "crypto-js";

export function deterministicId(
  originalId: string,
  additionalString: string
): string {
  const combinedString = `${originalId}:${additionalString}`;
  const hash = CryptoJS.SHA256(combinedString);
  const newId = hash.toString(CryptoJS.enc.Hex);

  return newId;
}
