export default async function handler(req, res) {
  const { path } = req.query;

  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "Invalid path" });
  }

  // Security: allow only expected paths
  if (!path.startsWith("/content/") && !path.startsWith("/graphql/")) {
    return res.status(403).json({ error: "Path not allowed" });
  }

  //const AEM_AUTHOR = process.env.AEM_AUTHOR_HOST;
  const USER = process.env.AEM_USER || "aemuser";
  const PASS = process.env.AEM_PASS || "aemuser";

  const targetUrl = `${getAuthorHost()}${path}`;

  const auth = Buffer
    .from(`${USER}:${PASS}`)
    .toString("base64");

  try {
    const aemResponse = await fetch(targetUrl, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    if (!aemResponse.ok) {
      return res.status(aemResponse.status).json({
        error: "AEM request failed"
      });
    }

    const contentType =
      aemResponse.headers.get("content-type") || "application/json";

    res.setHeader("Content-Type", contentType);

    const body = await aemResponse.text();
    res.status(200).send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const getAuthorHost = () => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    if (searchParams.has("authorHost")) {
        return searchParams.get("authorHost");
    } else {
        return "https://author-p169008-e1803621.adobeaemcloud.com";
    }
}
