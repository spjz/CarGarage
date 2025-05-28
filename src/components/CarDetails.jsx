import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VehicleEnquiryService from '../services/dvla';
import { ArrowUturnLeftIcon, ArrowPathIcon, BackspaceIcon } from '@heroicons/react/24/solid';

const CACHE_PREFIX = 'vehicle_details_';
const IMAGE_PREFIX = 'vehicle_image_';

function CarDetails() {
    const { registrationnumber } = useParams();
    const [ carDetails, setCarDetails ] = useState(null);
    const [ error, setError ] = useState(null);
    const [ loading, setLoading]  = useState(true);
    const [ isRefreshing, setIsRefreshing ] = useState(false);
    const [ carImage, setCarImage ] = useState(null);

    // Load saved image on component mount
    useEffect(() => {
        if (registrationnumber) {
            const savedImage = localStorage.getItem(`${IMAGE_PREFIX}${registrationnumber}`);
            if (savedImage) {
                setCarImage(savedImage);
            }
        }
    }, [registrationnumber]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result;
                setCarImage(imageData);
                localStorage.setItem(`${IMAGE_PREFIX}${registrationnumber}`, imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchCarDetails = async (forceRefresh = false) => {
        if (!registrationnumber) {
            setError('Please provide a registration number');
            setLoading(false);
            return;
        }

        try {
            if (forceRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            
            // Check cache first, unless forcing refresh
            const cacheKey = `${CACHE_PREFIX}${registrationnumber}`;
            const cachedData = !forceRefresh ? localStorage.getItem(cacheKey) : null;
            
            if (cachedData) {
                setCarDetails(JSON.parse(cachedData));
                setError(null);
                setLoading(false);
                return;
            }

            // Fetch from API
            const car = await VehicleEnquiryService.getRegistrationDetails(registrationnumber);
            
            // Store in cache
            localStorage.setItem(cacheKey, JSON.stringify(car));
            
            setCarDetails(car);
            setError(null);
        } catch (error) {
            setError(error.message);
            setCarDetails(null);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCarDetails();
    }, [registrationnumber]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading vehicle details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="mb-4 flex gap-2">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowUturnLeftIcon className="size-6 text-white-500" />
                        <span>Return to Garage</span>
                    </Link>
                    <button
                        onClick={() => {
                            const savedVehicles = JSON.parse(localStorage.getItem('garage_vehicles') || '[]');
                            const updatedVehicles = savedVehicles.filter(v => v.registrationNumber !== registrationnumber);
                            localStorage.setItem('garage_vehicles', JSON.stringify(updatedVehicles));
                            window.location.href = '/';
                        }}
                        className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <BackspaceIcon className="size-6 text-white-500" />
                        <span>Remove from Garage</span>
                    </button>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!carDetails) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">No vehicle details available.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex gap-2">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <ArrowUturnLeftIcon className="size-6 text-white-500" />
                    <span>Return to Garage</span>
                </Link>
                <button
                    onClick={() => fetchCarDetails(true)}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                    <ArrowPathIcon className={`size-6 text-white-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Updating...' : 'Update Details'}</span>
                </button>
                <button
                    onClick={() => {
                        const savedVehicles = JSON.parse(localStorage.getItem('garage_vehicles') || '[]');
                        const updatedVehicles = savedVehicles.filter(v => v.registrationNumber !== registrationnumber);
                        localStorage.setItem('garage_vehicles', JSON.stringify(updatedVehicles));
                        window.location.href = '/';
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <BackspaceIcon className="size-6 text-white-500" />
                    <span>Remove from Garage</span>
                </button>
            </div>
            <h2 className="mb-4 text-2xl font-semibold">Vehicle Details</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Registration: {carDetails.registrationNumber}
                    </h3>
                    <div className="mt-4">
                        <div className="flex flex-col items-center">
                            {carImage ? (
                                <div className="relative">
                                    <img 
                                        src={carImage} 
                                        alt={`${carDetails.registrationNumber}`}
                                        className="max-w-md rounded-lg shadow-lg"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setCarImage(null);
                                                localStorage.removeItem(`${IMAGE_PREFIX}${registrationnumber}`);
                                            }}
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                            title="Remove image"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <p className="mt-1">Click to upload vehicle image</p>
                                            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Make</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.make}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Colour</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.colour}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Year of Manufacture</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.yearOfManufacture}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Month of First Registration</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.monthOfFirstRegistration}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.fuelType}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Engine Capacity</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.engineCapacity} cc</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">CO2 Emissions</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.co2Emissions} g/km</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Euro Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.euroStatus}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Real Driving Emissions</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.realDrivingEmissions}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">MOT Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.motStatus}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Tax Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.taxStatus}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Tax Due Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.taxDueDate}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">ART End Date</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.artEndDate}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Revenue Weight</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.revenueWeight} kg</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Type Approval</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.typeApproval}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Wheelplan</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.wheelplan}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Marked for Export</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.markedForExport ? 'Yes' : 'No'}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Date of Last V5C Issued</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{carDetails.dateOfLastV5CIssued}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

export default CarDetails;