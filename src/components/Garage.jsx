import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VehicleEnquiryService from '../services/dvla';
import { BackspaceIcon, DocumentCheckIcon, PlusIcon, ListBulletIcon } from '@heroicons/react/24/solid'

const STORAGE_KEY = 'garage_vehicles';
const VALIDATION_FLAG_KEY = 'garage_vehicles_validated';
const IMAGE_PREFIX = 'vehicle_image_';

function Garage() {
    const [vehicles, setVehicles] = useState(() => {
        const savedVehicles = localStorage.getItem(STORAGE_KEY);
        return savedVehicles ? JSON.parse(savedVehicles) : [
            { id: 1, registrationNumber: 'ABC123' },
            { id: 2, registrationNumber: 'XYZ789' },
            { id: 3, registrationNumber: 'LMN456' },
            { id: 4, registrationNumber: 'DEF012' },
            { id: 5, registrationNumber: 'SW03PER' },
        ];
    });
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [error, setError] = useState(null);
    const [newRegistration, setNewRegistration] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [selectedVehicleImage, setSelectedVehicleImage] = useState(null);

    // Save vehicles to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    }, [vehicles]);

    useEffect(() => {
        const hasValidated = localStorage.getItem(VALIDATION_FLAG_KEY);
        if (!hasValidated) {
            validateAllVehicles();
            localStorage.setItem(VALIDATION_FLAG_KEY, 'true');
        }
    }, []);

    // Load selected vehicle image when selection changes
    useEffect(() => {
        if (selectedVehicle) {
            const savedImage = localStorage.getItem(`${IMAGE_PREFIX}${selectedVehicle.registrationNumber}`);
            setSelectedVehicleImage(savedImage);
        } else {
            setSelectedVehicleImage(null);
        }
    }, [selectedVehicle]);

    const validateAllVehicles = async () => {
        setIsValidating(true);
        setError(null);
        
        try {
            const updatedVehicles = await Promise.all(
                vehicles.map(async (vehicle) => {
                    try {
                        const details = await VehicleEnquiryService.getRegistrationDetails(vehicle.registrationNumber);
                        return {
                            ...vehicle,
                            make: details.make,
                            model: details.model,
                            colour: details.colour,
                            fuelType: details.fuelType,
                            yearOfManufacture: details.yearOfManufacture,
                            validationStatus: 'valid'
                        };
                    } catch (error) {
                        console.error(`Failed to validate vehicle ${vehicle.registrationNumber}:`, error);
                        return {
                            ...vehicle,
                            validationStatus: 'invalid',
                            validationError: error.message
                        };
                    }
                })
            );
            
            setVehicles(updatedVehicles);
        } catch (error) {
            setError('Failed to validate some vehicles. Please try again later.');
        } finally {
            setIsValidating(false);
        }
    };

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
            
            {isValidating && (
                <p className="mb-4 text-blue-500">Validating vehicles...</p>
            )}
            
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
                    <li key={vehicle.id} className={`flex justify-between p-2 rounded-md ${
                        vehicle.validationStatus === 'invalid' ? 'bg-red-50' : 'bg-gray-100'
                    }`}>
                        <div>
                            <span className="font-medium">{vehicle.registrationNumber}</span>
                            {vehicle.make && (
                                <span className="ml-2 text-gray-600">
                                    {vehicle.make} {vehicle.model} ({vehicle.colour})
                                </span>
                            )}
                            {vehicle.validationStatus === 'invalid' && (
                                <div className="mt-1 text-sm text-red-500">
                                    {vehicle.validationError || 'Failed to validate vehicle'}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => removeVehicle(vehicle.id)}
                                className="text-red-500 flex items-center gap-1 hover:underline"
                            >
                                <BackspaceIcon className="size-6 text-red-500" />
                                Remove
                            </button>
                            <button
                                onClick={() => handleSelectVehicle(vehicle.id)}
                                className="text-blue-500 flex items-center gap-1 hover:underline"
                            >
                                <DocumentCheckIcon className="size-6 text-blue-500" />
                                Select
                            </button>
                            <Link
                                to={`/car/${vehicle.registrationNumber}`}
                                className="text-green-500 flex items-center gap-1 hover:underline"
                            >
                                <ListBulletIcon className="size-6 text-black-500" />
                                <span className="">View Details</span>
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
            {selectedVehicle && (
                <div className="mt-4 p-4 bg-gray-200 rounded-md">
                    <h3 className="text-xl font-semibold mb-4">Selected Vehicle</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <p className="mb-2"><span className="font-medium">Registration Number:</span> {selectedVehicle.registrationNumber}</p>
                            {selectedVehicle.make && (
                                <p className="mb-2"><span className="font-medium">Make:</span> {selectedVehicle.make}</p>
                            )}
                            {selectedVehicle.model && (
                                <p className="mb-2"><span className="font-medium">Model:</span> {selectedVehicle.model}</p>
                            )}
                            {selectedVehicle.colour && (
                                <p className="mb-2"><span className="font-medium">Colour:</span> {selectedVehicle.colour}</p>
                            )}
                            {selectedVehicle.fuelType && (
                                <p className="mb-2"><span className="font-medium">Fuel Type:</span> {selectedVehicle.fuelType}</p>
                            )}
                            {selectedVehicle.yearOfManufacture && (
                                <p className="mb-2"><span className="font-medium">Year:</span> {selectedVehicle.yearOfManufacture}</p>
                            )}
                        </div>
                        <div className="flex-1">
                            {selectedVehicleImage ? (
                                <div className="relative">
                                    <img 
                                        src={selectedVehicleImage} 
                                        alt={`${selectedVehicle.registrationNumber}`}
                                        className="w-full max-w-md rounded-lg shadow-lg"
                                    />
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                                    <p className="text-gray-500">No image available</p>
                                    <p className="text-sm text-gray-400 mt-1">Upload an image in the vehicle details page</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Garage;