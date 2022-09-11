import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as fs from "fs";
import * as mime from "mime";
import { CdnWebsite } from "./cdn-website";
import * as checkly from "@checkly/pulumi";
const staticWebsiteDirectory = "website";

const website = new CdnWebsite("your-startup", {});
export const websiteUrl = website.url;

new checkly.Check("index-page", {
  activated: true,
  frequency: 10,
  type: "BROWSER",
  locations: ["eu-west-2"],
  script: websiteUrl.apply((url) =>
    fs
      .readFileSync("checkly-embed.js")
      .toString("utf8")
      .replace("{{websiteUrl}}", url)
  ),
});

import { Swag } from "./swag-provider";

const swag = new Swag("your-startup", {
  name: "susan",
  email: "susan.ra.evans@gmail.com",
  address: "32707 ne 195th st duvall wa 98019 united states",
  size: "M",
});
