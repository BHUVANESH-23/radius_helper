import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const FlyToLocation = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(coordinates, 12);
    }, [coordinates, map]);
    return null;
};

const MapClickHandler = ({ selectingLocation, setCoordinates, setSelectingLocation, setCirclePosition, sendDataToServer, circleRadius }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const container = map.getContainer();

        const handleMouseLeave = () => {
            if (selectingLocation) {
                setCirclePosition(null);
            }
        };

        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [map, selectingLocation, setCirclePosition]);

    useMapEvents({
        mousemove: (event) => {
            if (selectingLocation) {
                setCirclePosition([event.latlng.lat, event.latlng.lng]);
            }
        },
        click: async (event) => {
            if (selectingLocation) {
                const selectedCenter = [event.latlng.lat, event.latlng.lng];
                setCoordinates(selectedCenter);
                setSelectingLocation(false);
                setCirclePosition(null);

                const userPrompt = prompt("Enter your prompt:");
                if (userPrompt) {
                    await sendDataToServer(selectedCenter, circleRadius, userPrompt);
                }
            }
        }
    });

    return null;
};


const Map = () => {
    const [coordinates, setCoordinates] = useState([20, 78]);
    const [selectingLocation, setSelectingLocation] = useState(false);
    const [circlePosition, setCirclePosition] = useState(null);
    const [circleRadius, setCircleRadius] = useState(5000);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowUp") {
                setCircleRadius((prev) => prev + 1000);
            } else if (event.key === "ArrowDown") {
                setCircleRadius((prev) => Math.max(1000, prev - 1000));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    const sendDataToServer = async (coordinates, radius, promptInput) => {
        try {
            const response = await axios.post("http://localhost:8080/api/gemini/generate", {
                latitude: coordinates[0],
                longitude: coordinates[1],
                radius: radius,
                prompt: promptInput
            });
            console.log("Data sent successfully:", response.data);
        } catch (error) {
            console.error("Error sending data to server:", error);
        }
    };


    const getCoordinates = async (city) => {
        try {
            if (city) {
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`);
                const data = response.data;
                if (data.length > 0) {
                    const newCoordinates = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    setCoordinates(newCoordinates);

                    // Prompt user for input after setting coordinates
                    const userPrompt = prompt("Enter your prompt:");
                    if (userPrompt) {
                        await sendDataToServer(newCoordinates, circleRadius, userPrompt);
                    }
                } else {
                    alert("City not found.");
                }
            }
        } catch (error) {
            console.error("Error fetching city coordinates:", error);
        }
    };


    const adjustRadius = (amount) => {
        setCircleRadius((prevRadius) => Math.max(1000, prevRadius + amount));
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    }, []);

    return (
        <div className="h-screen w-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center relative">
            {/* Search Box */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-5 w-96 flex flex-row justify-between items-center">
                <input
                    type="text"
                    placeholder="Enter City..."
                    className="flex-1 mr-4 px-4 py-2 border border-gray-300 rounded-lg shadow-inner text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") getCoordinates(e.target.value);
                    }}
                />
                <button
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg shadow-md"
                    onClick={() => {
                        const cityInput = document.querySelector("input").value;
                        getCoordinates(cityInput);
                    }}
                >
                    Search
                </button>
            </div>

            {/* Controls */}
            <div className="absolute top-10 right-6 flex space-x-4">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-full shadow-md hover:from-green-500 hover:to-green-700 transition-transform transform hover:scale-105"
                    onClick={() => adjustRadius(1000)}
                >
                    ➕ Increase
                </button>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold rounded-full shadow-md hover:from-red-500 hover:to-red-700 transition-transform transform hover:scale-105"
                    onClick={() => adjustRadius(-1000)}
                >
                    ➖ Decrease
                </button>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-semibold rounded-full shadow-md hover:from-gray-300 hover:to-gray-400 transition-transform transform hover:scale-105"
                    onClick={() => setSelectingLocation(true)}
                >
                    📍 Select
                </button>
            </div>


            {/* Map Container */}
            <div className="w-11/12 md:w-4/5 lg:w-3/4 h-4/5 mt-26 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-indigo-400/30">
                <MapContainer
                    style={{ height: "100%", width: "100%" }}
                    center={coordinates}
                    zoom={10}
                    className="rounded-3xl"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FlyToLocation coordinates={coordinates} />
                    <MapClickHandler
                        selectingLocation={selectingLocation}
                        setCoordinates={setCoordinates}
                        setSelectingLocation={setSelectingLocation}
                        setCirclePosition={setCirclePosition}
                        sendDataToServer={sendDataToServer}  
                        circleRadius={circleRadius}          
                    />

                    {circlePosition && <Circle center={circlePosition} radius={circleRadius} color="blue" />}
                    <Marker position={coordinates} icon={customIcon}>
                        <Popup className="text-indigo-600 font-semibold">Your Selected Location</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default Map;
