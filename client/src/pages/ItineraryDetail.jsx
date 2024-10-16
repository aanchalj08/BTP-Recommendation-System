import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DisplayContainer from "./DisplayContainer";

const ItineraryDetail = () => {
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("auth"));
        const response = await axios.get(
          `${baseUrl}/api/v1/publication/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPublication(response.data.publication);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch publication");
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!publication) return <div>Publication not found</div>;

  return (
    <DisplayContainer
      title={publication.title}
      journalTitle={publication.journalTitle}
      authors={publication.authors}
      issnNumber={publication.issnNumber}
      publicationDate={publication.publicationDate}
      citationCount={publication.citationCount}
      pageNumbers={publication.pageNumbers}
      keywords={publication.keywords}
      link={publication.paperLink}
      description={publication.description}
    />
  );
};

export default ItineraryDetail;
