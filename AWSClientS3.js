const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CreateBucketCommand, GetBucketVersioningCommand, DeleteBucketCommand, ListBucketsCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const AWSClientS3Error = require("./AWSClientS3Error");

/**
 * Transforms a ReadableStream into a Buffer
 * @param {ReadableStream} stream
 * @returns {Promise.<Buffer>} Promise that resolves to original file contents as a Buffer
 */

const streamToBuffer = (stream) => new Promise((resolve, reject) => {
	const chunks = [];
	stream.on("data", chunk => chunks.push(chunk));
	stream.on("error", err => reject(err));
	stream.on("end", () => resolve(Buffer.concat(chunks)));
});

/**
 * Transforms a ReadableStream into a string
 * @param {ReadableStream} stream 
 * @returns {Promise.<string>} Promise that resolves to original file contents as a UTF-8 encoded string
 */

const streamtoString = (stream) => new Promise((resolve, reject) => {
	const chunks = [];
	stream.on("data", chunk => chunks.push(chunk));
	stream.on("error", err => reject(err));
	stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
});

class AWSClientS3 extends S3Client {
	/**
	 * @constructs AWSClientS3
	 * @param {object} config - [AWSClientS3 configuration options]{@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/s3clientconfig.html}
	 * @param {string} config.region - Destination AWS S3 bucket's region
	 * @param {object} config.credentials - AWS programmatic access credentials 
	 * @param {string} config.credentials.accessKeyId - AWS Access Key ID
	 * @param {string} config.credentials.secretAccessKey - AWS Secret Access Key
	 * @throws Will throw an Error if required arguments are missing
	 */
	constructor(config) {
		if (!config.region) throw new AWSClientS3Error({
			message: "The S3 client couldn't be configured properly",
			error: "Missing AWS S3 buckets region"
		});
		else if (!(config.credentials.accessKeyId && config.credentials.secretAccessKey)) throw new AWSClientS3Error({
			message: "The S3 client couldn't be configured properly",
			error: "Missing AWS Access Key ID and/or Secret Access Key"
		});
		super(config);
	}
	/**
	 * Returns pre-signed URL for specific S3 object
	 * @param {object} objectParams - Target object's location data (bucket and key)
	 * @param {string} objectParams.bucket - Target object's bucket
	 * @param {string} objectParams.key - Target object's key
	 * @param {object} [presignedUrlOptions] - Config options for resultant pre-signed URL
	 * @throws Will throw an Error if required arguments are missing
	 * @returns {Promise<string>} Promise which resolves to the pre-sgiend URL for the requested object
	 */
	async getPresignedUrl(objectParams, presignedUrlOptions=null) {
		if (!(objectParams.bucket && objectParams.key)) throw new AWSClientS3Error({
			message: "Couldn't generate pre-signed URL",
			error: "Missing object bucket and/or key"
		});
		const command = new GetObjectCommand({
			Bucket: objectParams.bucket,
			Key: objectParams.key
		});
		return await getSignedUrl(this, command, presignedUrlOptions);
	}
	/**
	 * Returns contents of specified S3 object
	 * @param {object} objectParams - Target object's location data (bucket and key)
	 * @param {string} objectParams.bucket - Target object's bucket
	 * @param {string} objectParams.key - Target object's key
	 * @param {string} [returnType=stream] - Return type for requested S3 object
	 * @throws Will throw an Error if required arguments are missing
	 * @returns {Promise<ReadableStream|Buffer|string>} Promise which resolves to the requested file's contents as the specified data type
	 */
	async readFile(objectParams, returnType="stream") {
		if (!(objectParams.bucket && objectParams.key)) throw new AWSClientS3Error({
			message: "Couldn't access S3 file to read",
			error: "Missing object bucket and/or key"
		});
		const command = new GetObjectCommand({
			Bucket: objectParams.bucket,
			Key: objectParams.key
		});
		const { Body: fileBodyStream } = await this.send(command);
		switch (returnType) {
		case "stream":
			return fileBodyStream;
		case "string":
			return streamtoString(fileBodyStream);
		case "buffer":
			return streamToBuffer(fileBodyStream);
		}
	}
	/**
	 * @async
	 * @description Uploads file object to specified S3 bucket and key destination
	 * @param {Buffer} file - File-to-upload as Buffer
	 * @param {object} objectParams - File-to-upload destination data (bucket and key)
	 * @param {string} objectParams.bucket - File-to-upload destination bucket
	 * @param {string} objectParams.key - File-to-upload destination key
	 * @throws Will throw an Error if required arguments are missing or not of expected type
	 * @returns {Promise.<PutObjectCommandOutput>}
	 */
	async uploadFile(file, objectParams) {
		if (!(objectParams.bucket && objectParams.key)) throw new AWSClientS3Error({
			message: "Couldn't upload file to S3",
			error: "Missing object destination bucket and/or key"
		});
		else if (!Buffer.isBuffer(file)) throw new AWSClientS3Error({
			message: "Couldn't upload file to S3",
			error: `Parameter 'file' must be of type Buffer. Received type ${typeof file}`
		});
		const command = new PutObjectCommand({
			Bucket: objectParams.bucket,
			Key: objectParams.key,
			Body: file
		});
		return await this.send(command);
	}
	/**
	 * @async
	 * @description Deletes specified file from S3 bucket at specified key
	 * @param {object} objectParams
	 * @param {string} objectParams.bucket - File-to-delete origin bucket
	 * @param {string} objectParams.key - File-to-delete origin key
	 * @throws Will throw an Error if required arguments are missing
	 * @returns {Promise.<DeleteObjectCommandOutput>}
	 */
	async deleteFile(objectParams) {
		if (!(objectParams.bucket && objectParams.key)) throw new AWSClientS3Error({
			message: "Couldn't delete file",
			error: "Missing object-to-delete origin bucket and/or key"
		});
		const command = new DeleteObjectCommand({
			Bucket: objectParams.bucket,
			Key: objectParams.key
		});
		return await this.send(command);
	}
	/**
	 * @async
	 * @description List objects of specified bucket with specified prefix (or all bucket objects if no prefix specified)
	 * @param {string} bucketName 
	 * @param {string} [prefix] 
	 * @throws Will throw an Error if required arguments are missing or not of expected type
	 * @returns {Promise.<ListObjectsV2CommandOutput>}
	 */
	async listBucketObjects(bucketName, prefix=null) {
		if (typeof bucketName !== "string") throw new TypeError("Parameter 'bucketName' must be of type string");
		else if (!bucketName.trim()) throw new RangeError("Parameter 'bucketName' cannot be an empty string");
		const command = new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: prefix
		});
		return await this.send(command);
	}
	/**
	 * @async
	 * @description Creates bucket with `bucketName` - If `bucketOptions` passed, these will override default options
	 * @param {string} bucketName - Name of new bucket
	 * @param {object} [bucketOptions] Bucket options as defined by the [AWS S3 SDK docs]{@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/interfaces/createbucketcommandinput.html}
	 * @throws Will throw an Error if required arguments are missing
	 * @returns {Promise.<CreateBucketCommandOutput>}
	 */
	async createBucket(bucketName, bucketOptions=null) {
		if (!bucketName) throw new AWSClientS3Error({
			message:" Couldn't create new bucket on S3",
			error: "Missing bucket-to-create name"
		});
		const command = new CreateBucketCommand({ 
			...bucketOptions,
			Bucket: bucketName
		});
		return await this.send(command);
	}
	/**
	 * @async
	 * @description Deletes specified bucket
	 * @param {string} bucketName - Name of bucket to delete
	 * @throws Will throw an Error if specified bucket is Versioning Enabled
	 * @returns {Promise.<DeleteBucketCommandOutput>}
	 */
	async deleteBucket(bucketName) {
		const { status: isBucketVersioningEnabled } = await this.send(new GetBucketVersioningCommand({
			Bucket: bucketName
		}));
		if (isBucketVersioningEnabled) throw new AWSClientS3({
			message: "Couldn't delete bucket",
			error: "Cannot programatically delete versioning-enabled bucket. Use the AWS Console or the AWS CLI for this operation"
		});
		const command = new DeleteBucketCommand({
			Bucket: bucketName
		});
		return await this.send(command);
	}
	/**
	 * Lists all buckets
	 * @returns {Promise.<ListBucketsCommandOutput>}
	 */
	async listBuckets() {
		const command = new ListBucketsCommand();
		return await this.send(command);
	}
};

module.exports = AWSClientS3;