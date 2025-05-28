import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleEnquiryService from '../services/dvla';

function Garage() {
    const [vehicles, setVehicles] = useState([
        { id: 1, registrationNumber: 'ABC123' },
        { id: 2, registrationNumber: 'XYZ789' },
        { id: 3, registrationNumber: 'LMN456' },
        { id: 4, registrationNumber: 'DEF012' },
    ]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [error, setError] = useState(null);
    const [newRegistration, setNewRegistration] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate registration number
        if (!newRegistration.trim()) {
            setError('Registration number cannot be empty');
            return;
        }

        // Check for duplicate registration numbers
        if (vehicles.some(v => v.registrationNumber === newRegistration.trim())) {
            setError('This registration number already exists');
            return;
        }

        setIsLoading(true);
        try {
            // Validate registration with DVLA service
            const vehicleDetails = await VehicleEnquiryService.getRegistrationDetails(newRegistration.trim());
            
            // Add new vehicle with additional details
            const newVehicle = {
                id: Math.max(...vehicles.map(v => v.id)) + 1,
                registrationNumber: newRegistration.trim(),
                make: vehicleDetails.make,
                model: vehicleDetails.model,
                colour: vehicleDetails.colour,
                fuelType: vehicleDetails.fuelType,
                yearOfManufacture: vehicleDetails.yearOfManufacture
            };

            setVehicles([...vehicles, newVehicle]);
            setNewRegistration('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const removeVehicle = (id) => {
        const updatedList = vehicles.filter((vehicle) => vehicle.id !== id);
        setVehicles(updatedList);

        if (selectedVehicle && selectedVehicle.id === id) {
            setSelectedVehicle(null);
        }
    };

    const handleSelectVehicle = (id) => {
        const foundVehicle = vehicles.find((vehicle) => vehicle.id === id);
        setSelectedVehicle(foundVehicle);
    };

    if (vehicles.length === 0) {
        return <p className="text-gray-500">No vehicles available in your garage.</p>;
    }

    if (selectedVehicle && !vehicles.some((v) => v.id === selectedVehicle.id)) {
        setSelectedVehicle(null);
    }

    return (
        <div className="p-6">
            <h2 className="mb-4 text-2xl font-semibold">Your Garage</h2>
            
            {/* Add Vehicle Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newRegistration}
                        onChange={(e) => setNewRegistration(e.target.value)}
                        placeholder="Enter registration number"
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Validating...' : 'Add Vehicle'}
                    </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </form>

            <ul className="space-y-2">
                {vehicles.map((vehicle, index) => (
                    <li key={vehicle.id} className="flex justify-between p-2 bg-gray-100 rounded-md">
                        <div>
                            <span className="font-medium">{vehicle.registrationNumber}</span>
                            {vehicle.make && (
                                <span className="ml-2 text-gray-600">
                                    {vehicle.make} {vehicle.model} ({vehicle.colour})
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => removeVehicle(vehicle.id)}
                                className="text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                            <button
                                onClick={() => handleSelectVehicle(vehicle.id)}
                                className="text-blue-500 hover:underline"
                            >
                                Select
                            </button>
                            <Link
                                to={`/car/${vehicle.registrationNumber}`}
                                className="text-green-500 hover:underline"
                            >
                                View Details
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
            {selectedVehicle && (
                <div className="mt-4 p-4 bg-gray-200 rounded-md">
                    <h3 className="text-xl font-semibold">Selected Vehicle</h3>
                    <p>Registration Number: {selectedVehicle.registrationNumber}</p>
                </div>
            )}
        </div>
    );
}

export default Garage;