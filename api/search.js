import axios from "axios";
import { parseStringPromise } from "xml2js";

// ✅ 출원번호 포맷: 4020090039000 → 40-2009-0039000
const formatAppNumber = (raw) => {
  if (!raw || raw.length !== 13) return raw;
  return `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6)}`;
};

// ✅ 출원일 포맷: 20200917 → 2020-09-17
const formatDate = (raw) => {
  if (!raw || raw.length !== 8) return raw;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`;
};

export default async function handler(req, res) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "keyword query param is required." });
  }

  const serviceKey = "7TRQDcz1tY0Lqz5UvhNj9pxUuCiFRcoEgpv7iy0A8Bo=";
  const url = `http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getWordSearch?searchString=${encodeURIComponent(keyword)}&searchRecentYear=0&ServiceKey=${serviceKey}`;

  try {
    const { data: xml } = await axios.get(url);
    const json = await parseStringPromise(xml, { explicitArray: false });

    const items = json?.response?.body?.items?.item;
    if (!items) {
      return res.json([]);
    }

    const results = Array.isArray(items) ? items : [items];

    const simplified = results.map((item) => ({
      title: item.title || "",
      applicationNumber: formatAppNumber(item.applicationNumber || ""),
      applicantName: item.applicantName || "",
      applicationDate: formatDate(item.applicationDate || ""),
      applicationStatus: item.applicationStatus || "",
      drawingUrl: item.drawing || ""
    }));

    res.status(200).json(simplified);
  } catch (error) {
    console.error("KIPRIS fetch error:", error);
    res.status(500).json({ error: "Failed to fetch or parse data from KIPRIS" });
  }
}
