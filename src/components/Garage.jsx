import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Garage() {
    const [vehicles, setVehicles] = useState([
        { id: 1, registrationNumber: 'ABC123' },
        { id: 2, registrationNumber: 'XYZ789' },
        { id: 3, registrationNumber: 'LMN456' },
        { id: 4, registrationNumber: 'DEF012' },
    ]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [error, setError] = useState(null);

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
            <ul className="space-y-2">
                {vehicles.map((vehicle, index) => (
                    <li key={vehicle.id} className="flex justify-between p-2 bg-gray-100 rounded-md">
                        <span>{vehicle.registrationNumber}</span>
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