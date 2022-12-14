const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CreateBucketCommand, GetBucketVersioningCommand, DeleteBucketCommand, ListBucketsCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const AWSClientS3Error = require("./AWSClientS3Error");

const streamToBuffer = (stream) => new Promise((resolve, reject) => {
	const chunks = [];
	stream.on("data", chunk => chunks.push(chunk));
	stream.on("error", err => reject(err));
	stream.on("end", () => resolve(Buffer.concat(chunks)));
});

const streamtoString = (stream) => new Promise((resolve, reject) => {
	const chunks = [];
	stream.on("data", chunk => chunks.push(chunk));
	stream.on("error", err => reject(err));
	stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
});

module.exports = class AWSClientS3 extends S3Client {
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
			return await streamtoString(fileBodyStream);
		case "buffer":
			return await streamToBuffer(fileBodyStream);
		}
	}
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
	async listBucketObjects(bucketName, prefix=null) {
		if (typeof bucketName !== "string") throw new TypeError("Parameter 'bucketName' must be of type string");
		else if (!bucketName.trim()) throw new RangeError("Parameter 'bucketName' cannot be an empty string");
		const command = new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: prefix
		});
		return await this.send(command);
	}
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
	async listBuckets() {
		const command = new ListBucketsCommand();
		return await this.send(command);
	}
};