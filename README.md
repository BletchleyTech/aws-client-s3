# **AWS Client S3**

AWS Client S3 is a developer-friendly Node.js client for Amazon Web Service's Simple Storage Service (AWS S3).

AWS Client S3 is built on top of AWS' official S3 SDK client. You can check out Amazon's official S3 client [here](https://npmjs.com/package/@aws-sdk/client-s3).

## **Contents**

- [Installation](#installation)
- [Introduction](#introduction)
- [Usage](#usage)
- [License](#license)

## **Installation**

```shell
$ npm install aws-client-s3
```

## **Introduction**

AWS Client S3 provides a more intuitive, developer-friendly interface to programatically access and manipulate S3 buckets and objects.

While with the official AWS client you'll have to create a `client` object, then a `command` object, and use the client's `send` method to query your S3 objects, AWS Client S3 makes this process much simpler by taking care of this process for you.

With the AWS SKD's S3 client, the process of getting a pre-signed URL looks like this:

```javascript
const s3Client = new S3Client(config);
const params = {
	Bucket: objectParams.bucket,
	Key: objectParams.key
};
const command = new GetObjectCommand(params);
const presignedUrl = await getSignedUrl(s3Client, command);
```

Along with the proper imports from `@aws-sdk/client-s3` for `GetObjectCommand` and `S3Client`, and `@aws-sdk/s3-request-presigner` for `getSignedUrl`.

With AWS Client S3, the same process looks like this:

```javascript
const client = new AWSS3Client(config);
const presignedUrl = await AWSS3Client.getPresignedUrl(params);
```

## **Usage**

To get started with AWSClientS3 to manage your AWS S3 integration, you'll first need to create an instance of the class, as so:

1. Require the package

	```javascript
	const AWSClientS3 = require("aws-client-s3");
	```

2. Define a `config` constant with the required data (*Note: the `config` constant must follow the below structure exactly. If you want to add special configurations to your client, be sure to follow AWS guidelines described [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html)*):

	```javascript
	const config = {
		region: "yourAWSS3Region",
		credentials: {
			accessKeyId: "yourAccessKeyId",
			secretAccessKey: "yourSecretAccessKey"
		}
	};
	```

3. Create your AWSClientS3 instance with the `config` defined before:

	```javascript
	const client = new AWSClientS3(config);
	```

At this point, you will have access to all of the AWSCLientS3 functionality, as well as the S3Client functionality from the official AWS S3 SDK.

## **License**

AWS Client S3 is licensed under the MIT license (see the [LICENSE](LICENSE) file for more information).