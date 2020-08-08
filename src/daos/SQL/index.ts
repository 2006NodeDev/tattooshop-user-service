import { Pool } from 'pg';
/*
"Important: A process gets envrmnt variables when it starts 
if you make envr variable while vscode/gitbash is running, it does not get the envr variable
you have to restart  vscode/git-bash
*/

//entrypoint for all of the database files
export const connectionPool: Pool = new Pool({
    host: process.env['TB_HOST'],
    user: process.env['TB_USER'],
    password: process.env['TB_PASSWORD'],
    database: process.env['TB_DATABASE'],
    port: 5432,
    max: 5  // max number of connections 
})