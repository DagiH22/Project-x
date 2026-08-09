const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://dagi@/postgres?host=/var/run/postgresql' });
pool.query('SELECT 1', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows);
  pool.end();
});
