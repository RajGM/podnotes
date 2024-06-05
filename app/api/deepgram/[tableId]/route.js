export async function GET(req, { params }) {
    const { tableId } = params;

    // Log the tableId and any other parameters
    console.log('tableId:', tableId);
    console.log('Query parameters:', req.query);

    return new Response(JSON.stringify({ message: `Received tableId: ${tableId}`, query: req.query }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req, { params }) {
    const { tableId } = params;
    const body = await req.json();

    // Log the tableId and any other parameters
    console.log('tableId:', tableId);
    console.log('Body:', body);

    return new Response(JSON.stringify({ message: `Received tableId: ${tableId}`, body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
