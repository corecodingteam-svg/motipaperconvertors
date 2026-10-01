import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("paper_providers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("tenant_id").notNullable().references("id").inTable("tenants").onDelete("CASCADE");
    t.string("name").notNullable();
    t.string("contact_person");
    t.string("phone");
    t.string("email");
    t.text("address");
    t.string("gstin");
    t.text("notes");
    t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    t.index(["tenant_id"]);
  });
  const tenants = await knex("tenants").select("id");
  const names = ["Prakashan Kendra", "Siddhi Vinayak", "Solar Press"];
  const rows = tenants.flatMap((t: { id: string }) => names.map((name) => ({ tenant_id: t.id, name })));
  if (rows.length) await knex("paper_providers").insert(rows);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("paper_providers");
}
