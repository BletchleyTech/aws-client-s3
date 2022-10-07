module.exports = class AWSClientS3Error extends Error {
	constructor(config) {
		super(config.message || "There was an error with the S3 client");
		this.name = "AWSClientS3Error";
		if (config.error) this.error = config.error;
	}
};
