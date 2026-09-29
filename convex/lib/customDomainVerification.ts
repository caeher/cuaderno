export type TxtRecordLookup = (hostname: string) => Promise<string[][]>

/** Concatenates DNS TXT chunks as required by the DNS record format. */
export async function hasExpectedTxtRecord(
  hostname: string,
  expectedValue: string,
  lookup: TxtRecordLookup
): Promise<boolean> {
  const records = await lookup(hostname)
  return records.some((chunks) => chunks.join("") === expectedValue)
}
