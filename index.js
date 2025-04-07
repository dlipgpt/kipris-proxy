const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ✅ 핵심 API: /search?keyword=카카오
app.get("/search", async (req, res) => {
  const keyword = req.query.keyword;
  const serviceKey = "7TRQDcz1tY0Lqz5UvhNj9pxUuCiFRcoEgpv7iy0A8Bo=";

  if (!keyword) {
    return res.status(400).json({ error: "keyword query param is required." });
  }

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

    res.json(simplified);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch or parse data from KIPRIS" });
  }
});

// 기본 루트 확인용
app.get("/", (req, res) => {
  res.send("✅ KIPRIS Proxy Server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
