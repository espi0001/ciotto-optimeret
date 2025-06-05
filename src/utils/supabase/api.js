import { createClient } from "./server"; // Importér funktion der opretter Supabase-klient

// Generic fetch by column (single)
// fetch efer én enkelt række ud fra en column og en value
export async function getByColumn(table, column, value) {
  const supabase = await createClient(); // Opret Supabase-klient

  // .eq(column, value) Finder rækker hvor column === value
  // .single() Returnerer kun én række
  const { data, error } = await supabase.from(table).select("*").eq(column, value).single();
  if (error) throw new Error(`${table} not found: ${error.message}`);
  return data; // Returnér resultatet (én række)
}

// fetch all rækker fra et table, sorteret efter id (stigende)
export async function getAll(table) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select("*").order("id", { ascending: true }); // .order("id", { ascending: true }); Sortér resultaterne efter id
  if (error) throw new Error(`Error fetching ${table}: ${error.message}`);
  return data; // Returnér alle rækker
}

// fetch relaterede rækker baseret på navn (prefix-match)
// Hvis intet match findes, returnér 4 tilfældige (dog forskellige fra id)
export async function getRelatedByName(table, id, name) {
  const supabase = await createClient(); // Opret Supabase-klient

  // Først: find række hvor navn matcher første ord i input (case-insensitive)
  let { data, error } = await supabase
    .from(table)
    .select("*")
    .neq("id", id) // Undgå at inkludere elementet med samme id
    .filter("name", "ilike", `${name.split(" ")[0]}%`); // Prefix match på navn

  if (error) throw new Error(`Error fetching related: ${error.message}`);

  // Hvis ingen relaterede blev fundet, hent i stedet 4 tilfældige rækker (også uden samme id)
  if (!data || data.length === 0) {
    const { data: randomData, error: randomError } = await supabase.from(table).select("*").neq("id", id).limit(4); // Begræns fallback-resultat til 4

    if (randomError) throw new Error(`Error fetching fallback: ${randomError.message}`);

    return randomData; // Returnér fallback
  }
  return data; // Returnér relaterede resultater
}
