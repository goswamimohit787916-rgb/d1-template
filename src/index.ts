export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });

    const { text } = await request.json();

    // 1. Tell Lightning AI to generate audio
    const response = await fetch("https://YOUR_LIGHTNING_URL/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text })
    });

    const audioBlob = await response.arrayBuffer();

    // 2. Log it in the Notebook (D1)
    await env.DB.prepare("INSERT INTO history (id, text_input) VALUES (?, ?)")
      .bind(crypto.randomUUID(), text).run();

    // 3. Send audio back to the website
    return new Response(audioBlob, {
      headers: { 
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  }
};
