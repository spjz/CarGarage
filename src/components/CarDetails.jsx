import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import VehicleEnquiryService from '../services/dvla';

function CarDetails() {
    const { registrationnumber } = useParams();
    const [carDetails, setCarDetails] = useState(null);
    const [error, setError] = useState(null);

    const fetchCarDetails = async () => {
        if (!registrationnumber) {
            setError('Invalid registration number');
            return;
        }

        // const mockData = [
        //     { registrationNumber: 'ABC123', make: 'Toyota', model: 'Corolla', year: 2020, color: 'Blue' },
        //     { registrationNumber: 'XYZ789', make: 'Honda', model: 'Civic', year: 2019, color: 'Red' },
        // ];

        const car = await VehicleEnquiryService.getRegistrationDetails(registrationnumber);
        // const car = mockData.find((item) => item.registrationNumber.toLocaleLowerCase() === registrationnumber.toLowerCase());

        if (!car) {
            setError(`Car with registration number ${registrationnumber} not found`);
            return;
        }

        setCarDetails({
            ...car,
            year: car.year,
        });
        setError(null);
    };

    if (!carDetails && !error) {
        fetchCarDetails();
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!carDetails) {
        return <p>No car details available.</p>;
    }

    return (
        <div className="p-6">
            <h2 className="mb-4 text-2xl font-semibold">Car Details</h2>
            <p><strong>Registration Number:</strong> {carDetails.registrationNumber}</p>
            <p><strong>Make:</strong> {carDetails.make}</p>
            <p><strong>Model:</strong> {carDetails.model}</p>
            <p><strong>Year:</strong> {carDetails.year}</p>
            <p><strong>Color:</strong> {carDetails.color}</p>
            <p><strong>Image:</strong> {carDetails.img}</p>
        </div>
    );
}

export default CarDetails;