const axios = require("axios");
const xml2js = require("xml2js");

export default async function handler(req, res) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "keyword query param is required." });
  }

  const serviceKey = "7TRQDcz1tY0Lqz5UvhNj9pxUuCiFRcoEgpv7iy0A8Bo=";
  const url = `http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getWordSearch?searchString=${encodeURIComponent(keyword)}&searchRecentYear=0&ServiceKey=${serviceKey}`;

  try {
    const { data: xml } = await axios.get(url);
    const json = await xml2js.parseStringPromise(xml, { explicitArray: false });

    const items = json?.response?.body?.items?.item;
    if (!items) {
      return res.json([]);
    }

    const results = Array.isArray(items) ? items : [items];

    const simplified = results.map((item) => ({
      title: item.title || "",
      applicationNumber: item.applicationNumber || "",
      applicantName: item.applicantName || "",
      applicationDate: item.applicationDate || "",
      applicationStatus: item.applicationStatus || "",
      drawingUrl: item.drawing || ""
    }));

    res.status(200).json(simplified);
  } catch (error) {
    console.error("KIPRIS fetch error:", error);
    res.status(500).json({ error: "Failed to fetch or parse data from KIPRIS" });
  }
}
