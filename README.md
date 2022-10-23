# **AWS Client S3**

AWS Client S3 is a developer-friendly Node.js client for Amazon Web Service's Simple Storage Service (AWS S3).

AWS Client S3 is built on top of AWS' official S3 SDK client. You can check out Amazon's official S3 client [here](https://npmjs.com/package/@aws-sdk/client-s3).

## **Contents**

- [Installation](#installation)
- [Introduction](#introduction)
- [Usage](#usage)
	- [Methods](#methods)
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

2. Define a `config` constant with the required data:

	```javascript
	const config = {
		region: "yourAWSS3Region",
		credentials: {
			accessKeyId: "yourAccessKeyId",
			secretAccessKey: "yourSecretAccessKey"
		}
	};
	```

	***Note: the `config` constant must follow the above structure exactly as far as it is described. If the `region` and/or `credentials` parameters are missing or are somehow malformed, the method will throw an AWSClientS3Error instance with information on why the operation failed.***
	
	If you want to add special configurations to your client (beyond `region` and `credentials`), be sure to follow AWS guidelines described [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html).

3. Create your AWSClientS3 instance with the `config` defined before:

	```javascript
	const client = new AWSClientS3(config);
	```

At this point, you will have access to all of the AWSCLientS3 functionality, as well as the S3Client functionality from the official AWS S3 SDK.

The new `client` instance will allow you to do the most common operations done on S3 buckets and objects with almost none of the hassle of using the official SDK.

Below you'll find all of the methods available in AWSClientS3 for your integration. If you don't find the implementation you're looking for, feel free to add an [issue](https://github.com/BletchleyTech/aws-client-s3/issues) on our [GitHub repository](https://github.com/BletchleyTech/aws-client-s3).

### **getPresignedUrl()**

The `getPresignedUrl()` method has one required parameter `objectParams` (an object containing two keys, `bucket` and `key`) and will return a Presigned URL that provides users with time-limited read-only access to the specified object.

If the `objectParams` parameter is missing the buckter and/or key for the object, the method will throw an AWSClientS3Error instance with information on why the operation failed.

The second, optional parameter `presignedUrlOptions`, is an object that specifies configuration options for the resulting URL. You can review these options [here](https://github.com/BletchleyTech/aws-client-s3/issues).

```javascript
const presignedUrl = await client.getPresignedUrl({
	bucket: "bucketName",
	key: "objectKey"
});

// Or handle it as a Promise

client.getPresignedUrl({
	bucket: "bucketName",
	key: "objectKey"
})
.then(presignedUrl => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [GetObjectCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html) (class)
2. [getSignedUrl](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_request_presigner.html#getsignedurl-1) (function)

### **readFile()**

The `readFile()` method allows you to programatically access the contents of an S3 object inside your application. This is especially useful over `getPresignedUrl()` when you want to integrate an existing file into your application. 

`readFile()` also has one required parameter and one optional argument. `objectParams` is the required argument for this method, which follows the same structure as its `getPresignedUrl()` counterpart. If the `objectParams` parameter is missing the bucket and/or key for the object, the method will throw an AWSClientS3Error instance with information on why the operation failed.

The second argument is a string that states the data staucture in which you wish to receive the file contents. This can be one of `stream` (default), `string`, or `buffer`. Using `stream` will return a `ReadableStream` object that you can pipe into your application, while `string` will return and UTF-8 encoded string and `buffer` will return your file contents as a Node.js Buffer.

```javascript
const fileStream = await client.readFile({
	bucket: "bucketName",
	key: "objectKey"
});

// Or handle it as a Promise

client.readFile({
	bucket: "bucketName",
	key: "objectKey"
})
.then(fileStream => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [GetObjectCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

### **uploadFile()**

This method allows you to upload files to an S3 bucket, or replace existing files without needing to delete the existing one beforehand. The method takes two parameters, both required, that define the contents and the location of the resulting file, respectively.

The first parameter, `file`, **must** be an instace of Buffer. The second parameter is `objectParams` (destination bucket and key). If the `file` parameter is not of type Buffer, or `objectParams` is missing the bucket and/or key for the object, the method will throw an AWSClientS3Error instance with information on why the operation failed.

The return value will be of type **[PutObjectCommandOutput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/putobjectcommandoutput.html)**.

```javascript
const fileUploadResult = await client.uploadFile(file, {
	bucket: "bucketName",
	key: "objectKey"
});

// Or handle it as a Promise

client.uploadFile(file, {
	bucket: "bucketName",
	key: "objectKey"
})
.then(fileUploadResult => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [PutObjectCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

### **deleteFile()**

The `deleteFile()` method will delete the specified file from an S3 bucket, defined in the `objectParams` parameter. This method doesn't take any more parameters. If the `objectParams` parameter is missing the bucket and/or key for the object, the method will throw an AWSClientS3Error instance with information on why the operation failed. **Note: For versioning-enabled buckets, `deleteFile()` will only delete the current version of the file.**

The return value will be of type **[DeleteObjectCommandOutput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deleteobjectcommandoutput.html)**.

```javascript
const fileDeleteResult = await client.deleteFile({
	bucket: "bucketName",
	key: "objectKey"
});

// Or handle it as a Promise

client.deleteFile(file, {
	bucket: "bucketName",
	key: "objectKey"
})
.then(fileDeleteResult => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [DeleteObjectCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deleteobjectcommand.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

### **listBucketObjects()**

This method allows you to see all the objects currently hosted in your S3 bucket. This method takes one required parameter `bucketName`, which tells the client which bucket to query, and one optional argument `prefix`, which allows you to filter out objects which key begins with a certain prefix (e.g. get all files in a 'folder').

The `bucketName` parameter must be of type `string` and not be an emtpy string, or the method will fail with a `TypeError` or a `RangeError`, respectively.

The return value will be of type **[ListObjectsV2CommandOutput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listobjectsv2commandoutput.html)**.

```javascript
const listObjectsResult = await client.listBucketObjects("bucketName");

// Or handle it as a Promise

client.listBucketObjects("bucketName")
.then(listObjectsResult => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [ListObjectsV2Command](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

### **createBucket()**

This method allows you to create a new S3 bucket. This method takes one required parameter `bucketName`, and one optional argument `bucketOptions`, which allows you to specify special configuration options for the new bucket to overwrite the default S3 bucket configurations associated with you account.

You can review the structure for `bucketOptions` [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createbucketcommandinput.html). *Please note that even if you specify a bucket name in the `Bucket` property, the method will overwrite this value with the `bucketName` parameter value.*

The return value will be of type **[CreateBucketCommandOutput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createbucketcommandoutput.html)**.

```javascript
const createBucketResult = await client.createBucket("bucketName");

// Or handle it as a Promise

client.createBucket("bucketName")
.then(createBucketResult => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [CreateBucketCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/createbucketcommand.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

### **deleteBucket()**

This method allows you to delete an existing S3 bucket. This method takes one required parameter `bucketName`, which tells the client which bucket to delete.

If the bucket you're trying to delete is versioning-enabled, the method will throw an AWSClientS3Error instance. This is due to AWS S3 configurations that don't allow a bucket to be deleted unless there are no objects and/or delete markers still in it. Delete markers are created when a file is deleted in a versioning-enabled bucket, and can only be removed from the AWS Console or the CLI.

The method will also not empty the bucket upon deletion, so trying to delete an occupied bucket will result in an error throw.

The return value will be of type **[DeleteBucketCommandOutput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/deletebucketcommandoutput.html)**.

```javascript
const deleteBucketResult = await client.deleteBucket("bucketName");

// Or handle it as a Promise

client.deleteBucket("bucketName")
.then(deleteBucketResult => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [DeleteBucketCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/deletebucketcommand.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

### **listBuckets()**

This method allows you to delete an existing S3 bucket.

The return value will be of type **[ListBucketsCommandOutput](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/listbucketscommandoutput.html)**.

```javascript
const listBucketsResult = await client.listBuckets();

// Or handle it as a Promise

client.listBuckets()
.then(listBucketsResult => {})
.catch(err => {});
```

#### **Related classes/methods/functions**

1. [ListBucketsCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listbucketscommand.html) (class)
2. [send](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/s3client.html#send) (function)

## **License**

AWS Client S3 is licensed under the MIT license (see the [LICENSE](LICENSE) file for more information).