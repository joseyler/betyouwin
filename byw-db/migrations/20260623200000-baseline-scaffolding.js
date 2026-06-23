'use strict';

/**
 * Migracion baseline: scaffolding sin tablas de negocio.
 * Las tablas de dominio se agregaran en migraciones incrementales posteriores.
 */
exports.up = function (db, callback) {
  db.runSql('SELECT 1', callback);
};

exports.down = function (db, callback) {
  db.runSql('SELECT 1', callback);
};
