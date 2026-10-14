import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("job_cards", (t) => {
    t.timestamp("deleted_at").nullable();
    t.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
    t.index(["tenant_id", "deleted_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("job_cards", (t) => {
    t.dropColumn("deleted_by");
    t.dropColumn("deleted_at");
  });
}
