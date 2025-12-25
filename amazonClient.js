import crypto from "crypto";
import axios from "axios";

const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;

const REGION = "us-east-1";
const SERVICE = "ProductAdvertisingAPI";
const HOST = "webservices.amazon.in";
const ENDPOINT = `https://${HOST}/paapi5/searchitems`;

function sign(key, msg) {
  return crypto.createHmac("sha256", key).update(msg).digest();
}

function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = sign(`AWS4${key}`, dateStamp);
  const kRegion = sign(kDate, regionName);
  const kService = sign(kRegion, serviceName);
  return sign(kService, "aws4_request");
}

export async function searchAmazonProducts(keyword) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payload = {
    Keywords: keyword,
    SearchIndex: "All",
    ItemCount: 5,
    Resources: [
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Images.Primary.Medium",
      "DetailPageURL"
    ],
    PartnerTag: ASSOCIATE_TAG,
    PartnerType: "Associates"
  };

  const payloadHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date";

  const canonicalRequest =
    `POST\n/paapi5/searchitems\n\n` +
    canonicalHeaders +
    `\n${signedHeaders}\n${payloadHash}`;

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope =
    `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

  const stringToSign =
    `${algorithm}\n${amzDate}\n${credentialScope}\n` +
    crypto.createHash("sha256").update(canonicalRequest).digest("hex");

  const signingKey = getSignatureKey(
    SECRET_KEY,
    dateStamp,
    REGION,
    SERVICE
  );

  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const authorizationHeader =
    `${algorithm} Credential=${ACCESS_KEY}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Encoding": "amz-1.0",
    "X-Amz-Date": amzDate,
    Authorization: authorizationHeader
  };

  const response = await axios.post(ENDPOINT, payload, { headers });
  return response.data;
}
