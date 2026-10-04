import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("job_inks", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("job_id").notNullable().references("id").inTable("job_cards").onDelete("CASCADE");
    t.uuid("inventory_item_id").notNullable().references("id").inTable("inventory_items").onDelete("RESTRICT");
    t.decimal("quantity", 12, 2).notNullable();
    t.timestamps(true, true);
    t.index("job_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("job_inks");
}
