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
            balance_cents INTEGER NOT NULL DEFAULT 0
        );
    `
}

export async function getBalance(sql: postgres.Sql<{}>, id: string) {
    const result = await sql`
        SELECT balance_cents
        FROM balance_table
        WHERE id = ${id};
    `

    if (result.length === 0) {
        await sql`
            INSERT INTO balance_table (id, balance_cents) VALUES (${id}, 0);
        `

        return 0;
    }

    return result[0].balance_cents;

}

export async function setBalance(sql: postgres.Sql<{}>, id: string, balanceCents: number) {
    return await sql`
        UPDATE balance_table
        SET balance_cents = ${balanceCents}
        WHERE id = ${id};
    `
}

export async function addBalance(sql: postgres.Sql<{}>, id: string, balanceCents: number) {
    const result = await sql`
        UPDATE balance_table
        SET balance_cents = balance_cents + ${balanceCents}
        WHERE id = ${id}
        RETURNING balance_cents;
    `

    return result[0].balance_cents;
}