import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("job_cards", (t) => {
    t.string("binding_type").nullable(); // name from tenant_settings key 'binding_type'
  });
  // Seed the default options for existing tenants; they are managed from Settings afterwards
  const tenants = await knex("tenants").select("id");
  const rows = tenants.flatMap((t: { id: string }) =>
    ["Loose", "Pad"].map((value) => ({ tenant_id: t.id, key: "binding_type", value })));
  if (rows.length) await knex("tenant_settings").insert(rows);
}

export async function down(knex: Knex): Promise<void> {
  await knex("tenant_settings").where({ key: "binding_type" }).delete();
  await knex.schema.alterTable("job_cards", (t) => {
    t.dropColumn("binding_type");
  });
}
