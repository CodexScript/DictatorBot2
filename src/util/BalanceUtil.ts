import postgres from "postgres";

export function formatCurrency(num: number, currencyCode = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}


export async function createBalancesTable(sql: postgres.Sql<{}>) {
    await sql`
        CREATE TABLE IF NOT EXISTS balance_table (
            id BIGINT PRIMARY KEY,
            balance_cents INTEGER NOT NULL DEFAULT 0,
            most_lost INTEGER NOT NULL DEFAULT 0,
            most_gained INTEGER NOT NULL DEFAULT 0
        );
    `
}

export async function getBalance(sql: postgres.Sql<{}>, id: string) {
    const result = await sql`
        SELECT balance_cents, most_lost, most_gained
        FROM balance_table
        WHERE id = ${id};
    `

    if (result.length === 0) {
        await sql`
            INSERT INTO balance_table (id) VALUES (${id});
        `

        return {
            'balance_cents': 0,
            'most_lost': 0,
            'most_gained': 0
        };
    }

    return result[0];

}

export async function setBalance(sql: postgres.Sql<{}>, id: string, balanceCents: number) {
    return await sql`
        UPDATE balance_table
        SET balance_cents = ${balanceCents}
        WHERE id = ${id};
    `
}

export async function setMostLost(sql: postgres.Sql<{}>, id: string, cents: number) {
    return await sql`
        UPDATE balance_table
        SET most_lost = ${cents}
        WHERE id = ${id} AND ${cents} > most_lost;
    `
}

export async function setMostGained(sql: postgres.Sql<{}>, id: string, cents: number) {
    return await sql`
        UPDATE balance_table
        SET most_gained = ${cents}
        WHERE id = ${id} AND ${cents} > most_gained;
    `
}

export async function addBalance(sql: postgres.Sql<{}>, id: string, balanceCents: number) {
    const result = await sql`
        INSERT INTO balance_table (id, balance_cents)
        VALUES (${id}, ${balanceCents})
        ON CONFLICT (id) DO UPDATE
        SET balance_cents = balance_table.balance_cents + EXCLUDED.balance_cents
        RETURNING balance_cents, most_gained, most_lost;
    `

    return result[0];
}