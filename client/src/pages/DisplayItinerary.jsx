import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/DisplayItinerary.css";
import DisplayContainer from "./DisplayContainer";
import axios from "axios";
import { toast } from "react-toastify";

const DisplayItinerary = () => {
  const location = useLocation();
  const {
    weatherData,
    restaurantData,
    accommodationData,
    accommodationType,
    itineraryData,
  } = location.state || {};
  const baseUrl = import.meta.env.VITE_BASE_URL;

  if (!weatherData || !restaurantData || !accommodationData || !itineraryData) {
    return <div>Loading... or No data available.</div>;
  }

  const saveItinerary = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const response = await axios.post(
        `${baseUrl}/api/v1/itinerary/save-itinerary`,
        {
          itineraryData,
          weatherData,
          restaurantData,
          accommodationData,
          accommodationType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(
          `Itinerary saved successfully! ID: ${response.data.itineraryId}`
        );
      }
    } catch (error) {
      alert("Failed to save itinerary");
    }
  };

  return (
    <div>
      <DisplayContainer
        weatherData={weatherData}
        restaurantData={restaurantData}
        accommodationData={accommodationData}
        accommodationType={accommodationType}
        itineraryData={itineraryData}
      ></DisplayContainer>
      <div className="save">
        <button onClick={saveItinerary} className="save-btn">
          Save itinerary
        </button>
      </div>
    </div>
  );
};

export default DisplayItinerary;
