import type { Knex } from "knex";
export async function up(knex: Knex) {
  await knex.schema.alterTable("paper_stock", t => {
    t.string("paper_source");
    t.string("bill_no");
    t.date("bill_date");
  });
}
export async function down(knex: Knex) {
  await knex.schema.alterTable("paper_stock", t => {
    t.dropColumn("paper_source");
    t.dropColumn("bill_no");
    t.dropColumn("bill_date");
  });
}
