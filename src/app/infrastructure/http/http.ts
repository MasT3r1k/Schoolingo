import { HttpException } from "./http.exception";

export const handleHttpException = (err: HttpException) => {
	// Get trace ID for tracing the error with OpenTelemetry

	if (err.statusCode >= 500) {
		console.error(err);
	}

	return (err.statusCode,
        {
		    message: err.message,
		    status_code: err.statusCode
	    }
    );
};