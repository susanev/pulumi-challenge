import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as fs from "fs";
import * as mime from "mime";
const staticWebsiteDirectory = "website";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.BucketV2(
    "bucketV2",
    {
      tags: {
        Name: "My bucket",
      },
    }
  );
  
const bucketAcl = new aws.s3.BucketAclV2("bAcl", {
    bucket: bucket.id,
    acl: aws.s3.PublicReadAcl,
});

fs.readdirSync(staticWebsiteDirectory).forEach((file) => {
    const filePath = `${staticWebsiteDirectory}/${file}`;
    const fileContent = fs.readFileSync(filePath).toString();

    new aws.s3.BucketObject(file, {
        bucket: bucket.id,
        source: new pulumi.asset.FileAsset(filePath),
        contentType: mime.getType(filePath) || undefined,
        acl: aws.s3.PublicReadAcl,
    });
});

const s3OriginId = "myS3Origin";

const cloudfrontDistribution = new aws.cloudfront.Distribution(
  "s3Distribution",
  {
    origins: [
      {
        domainName: bucket.bucketRegionalDomainName,
        originId: s3OriginId,
      },
    ],
    enabled: true,
    isIpv6Enabled: true,
    comment: "Some comment",
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
      allowedMethods: [
        "DELETE",
        "GET",
        "HEAD",
        "OPTIONS",
        "PATCH",
        "POST",
        "PUT",
      ],
      cachedMethods: ["GET", "HEAD"],
      targetOriginId: s3OriginId,
      forwardedValues: {
        queryString: false,
        cookies: {
          forward: "none",
        },
      },
      viewerProtocolPolicy: "allow-all",
      minTtl: 0,
      defaultTtl: 3600,
      maxTtl: 86400,
    },
    priceClass: "PriceClass_200",
    restrictions: {
      geoRestriction: {
        restrictionType: "whitelist",
        locations: ["US", "CA", "GB", "DE"],
      },
    },
    viewerCertificate: {
      cloudfrontDefaultCertificate: true,
    },
  }
);

// Export the name of the bucket
export const bucketName = bucket.id;
