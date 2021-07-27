export async function fetchPostJsonCsrf(url: string, data?: {}) {
  try {
    const nextDataEl = document.getElementById("__NEXT_DATA__");
    if (!nextDataEl || !nextDataEl.textContent) {
      throw new Error("Cannot read from __NEXT_DATA__ element");
    }
    const nextData = JSON.parse(nextDataEl.textContent);
    const CSRF_TOKEN = nextData.query.CSRF_TOKEN;
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": CSRF_TOKEN,
      },
      body: JSON.stringify(data || {}),
    });
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}
