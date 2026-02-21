import {KreditTransaction} from "../types";

export function parseRCBC(text: string): KreditTransaction[] {
  const regex =
    /^([\d,]+\.\d{2}-?)\t(\d{2}\/\d{2}\/\d{2}) (\d{2}\/\d{2}\/\d{2}) (.+)$/;

  return text
    .split("\n")
    .map((line) => regex.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(([, amountStr, saleDate, postDate, description]) => {
      const cleanAmount = parseFloat(
        amountStr.replace(/,/g, "").replace("-", "")
      );

      const amount = amountStr.endsWith("-")
        ? -cleanAmount
        : cleanAmount;

      return {
        saleDate,
        postDate,
        description: description.trim(),
        amount,
      };
    });
}