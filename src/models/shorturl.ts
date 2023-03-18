// shorturl.ts
// Model for shortUrl database

import { Schema, model, Document } from "mongoose";

export interface IShortUrl extends Document {
  original_url: string;
  short_url: string;
}

const shortUrlSchema = new Schema<IShortUrl>({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true },
});

const MShortUrl = model<IShortUrl>("ShortUrl", shortUrlSchema);

export default MShortUrl;
