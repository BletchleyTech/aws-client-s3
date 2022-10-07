const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
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
			return streamtoString(fileBodyStream);
		case "buffer":
			return streamToBuffer(fileBodyStream);
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
};