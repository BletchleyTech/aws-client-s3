module.exports = class AWSClientS3Error extends Error {
	/**
	 * @constructs AWSClientS3Error
	 * @param {object} config - AWSClientS3Error configuration options
	 * @param {string} [config.message] - Message to be shown as error description
	 * @param {Error} [config.error] - Original Error instance
	 */
	constructor(config) {
		super(config.message || "There was an error with the S3 client");
		this.name = "AWSClientS3Error";
		if (config.error) this.error = config.error;
	}
};
