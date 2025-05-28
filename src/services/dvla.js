const VehicleEnquiryService = {

    /**
     * DVLA Vehicle Enquiry Service
     * Request vehicle information by calling getRegistrationDetails(string registrationNumber)
     */
    getRegistrationDetails: async function (registrationNumber) {
        try {
            const response = await fetch('/api/vehicle-enquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ registrationNumber: registrationNumber })
            });

            const data = await response.json();

            // Handle API error responses
            if (data.errors) {
                const error = data.errors[0];
                switch (error.status) {
                    case '400':
                        throw new Error('Invalid registration number format. Please check and try again.');
                    case '404':
                        throw new Error('Vehicle not found. Please check the registration number.');
                    case '500':
                        throw new Error('DVLA service is experiencing technical difficulties. Please try again later.');
                    case '503':
                        throw new Error('DVLA service is currently unavailable. Please try again later.');
                    default:
                        throw new Error(error.detail || 'An error occurred while fetching vehicle details.');
                }
            }

            // Handle HTTP error status codes
            if (!response.ok) {
                switch (response.status) {
                    case 400:
                        throw new Error('Invalid registration number format. Please check and try again.');
                    case 404:
                        throw new Error('Vehicle not found. Please check the registration number.');
                    case 500:
                        throw new Error('DVLA service is experiencing technical difficulties. Please try again later.');
                    case 503:
                        throw new Error('DVLA service is currently unavailable. Please try again later.');
                    default:
                        throw new Error('An error occurred while fetching vehicle details.');
                }
            }

            return data;
        } catch (error) {
            // Handle network errors or other exceptions
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the DVLA service. Please check your internet connection and try again.');
            }
            // Re-throw the error with the user-friendly message
            throw error;
        }
    }
}

export default VehicleEnquiryService;