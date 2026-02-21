const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Fake News Detector Backend Running");
});

// main extractor
app.post("/extract", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.json({ success: false, error: "No URL provided" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // remove junk
    $("script, style, nav, footer, header, aside, iframe, noscript").remove();

    let articleText = "";

    $("p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 40) {
        articleText += text + " ";
      }
    });

    articleText = articleText.substring(0, 3500);

    if (!articleText || articleText.length < 200) {
      return res.json({
        success: false,
        error: "Could not extract readable article",
      });
    }

    res.json({ success: true, text: articleText });
  } catch (err) {
    res.json({ success: false, error: "Website blocked scraping" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));