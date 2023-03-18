// apiRouter.js
// Router with the handlers for /api for the url shortener project

import express from "express";
import dns from "dns";
import { nanoid } from "nanoid";
import MShortUrl from "./models/shorturl";

const router = express.Router();

router.post("/shorturl", async (req, res) => {
  const original_url = req.body.url;
  const shortUrlLength = 8;

  if (!(await isValidUrl(original_url))) {
    res.json({ error: "invalid url" });
    console.log("Post with invalid url: ", original_url);
    return;
  }

  try {
    const oldUrl = await MShortUrl.findOne({ original_url });
    if (oldUrl) {
      const { short_url } = oldUrl;
      res.json({ original_url, short_url });
    } else {
      const short_url = nanoid(shortUrlLength);
      const newUrl = new MShortUrl({ original_url, short_url });
      await newUrl.save();
      res.json({ original_url, short_url });
    }
  } catch (err) {
    res.status(500).send("Problem connecting to the database");
    console.log("Error connecting to the database: ", err);
  }
});

router.get("/shorturl/:shorturl", async (req, res) => {
  const short_url = req.params.shorturl;
  try {
    const urlInDB = await MShortUrl.findOne({ short_url });
    if (urlInDB) {
      res.redirect(urlInDB.original_url);
    } else {
      res.status(400).send(`Short url not found: " ${short_url}\n`);
    }
  } catch (err) {
    res.status(500).send("Problem connecting to the database");
    console.log("Error connecting to the database: ", err);
  }
});

// Functions to check submitted url validity
async function isValidUrl(str: string): Promise<boolean> {
  try {
    const url = new URL(str);
    return (
      acceptedProtocol(url.protocol) && (await isValidHostname(url.hostname))
    );
  } catch {
    return false;
  }
}

async function isValidHostname(hostname: string): Promise<boolean> {
  try {
    await dns.promises.lookup(hostname);
    return true;
  } catch {
    console.log("Could not resolve hostname: ", hostname);
    return false;
  }
}

function acceptedProtocol(protocol: string) {
  return /https?:/.test(protocol);
}

export default router;
