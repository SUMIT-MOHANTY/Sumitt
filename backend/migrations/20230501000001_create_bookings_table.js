/**
 * @param {import('knex')} knex
 * @returns {Promise}
 */
exports.up = function(knex) {
  return knex.schema.createTable('bookings', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Foreign keys
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('slot_id').notNullable().references('id').inTable('slots').onDelete('CASCADE');

    // Booking details
    table.timestamp('booking_date').notNullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.text('notes');

    // Metadata
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Unique constraint to prevent double bookings
    table.unique(['user_id', 'slot_id']);

    // Indexes
    table.index('user_id');
    table.index('slot_id');
    table.index('status');
    table.index('booking_date');
  }).catch(error => {
    console.error('Migration failed:', error);
    throw error;
  });
};

/**
 * @param {import('knex')} knex
 * @returns {Promise}
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bookings');
};
