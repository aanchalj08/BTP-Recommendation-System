import React, { useState } from "react";
import "../styles/AddPublication.css";
import Navbar from "./Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaMinus } from "react-icons/fa";

const AddPublication = () => {
  const [name, setName] = useState("");
  const [issnNumber, setIssnNumber] = useState("");
  const [authors, setAuthors] = useState([""]);
  const [title, setTitle] = useState("");
  const [journalTitle, setJournalTitle] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [citationCount, setCitationCount] = useState("");
  const [pageNumbers, setPageNumbers] = useState("");
  const [keywords, setKeywords] = useState([""]);
  const [paperLink, setPaperLink] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleAddAuthor = () => {
    setAuthors([...authors, ""]);
  };

  const handleRemoveAuthor = (index) => {
    const updatedAuthors = authors.filter((_, i) => i !== index);
    setAuthors(updatedAuthors);
  };

  const handleAuthorChange = (index, value) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index] = value;
    setAuthors(updatedAuthors);
  };

  const handleAddKeyword = () => {
    setKeywords([...keywords, ""]);
  };

  const handleRemoveKeyword = (index) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(updatedKeywords);
  };

  const handleKeywordChange = (index, value) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = value;
    setKeywords(updatedKeywords);
  };

  const clearForm = () => {
    setName("");
    setIssnNumber("");
    setAuthors([""]);
    setTitle("");
    setJournalTitle("");
    setPublicationDate("");
    setCitationCount("");
    setPageNumbers("");
    setKeywords([""]);
    setPaperLink("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const token = JSON.parse(localStorage.getItem("auth"));
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const authorsJson = JSON.stringify(authors);
      const keywordsJson = JSON.stringify(keywords);

      const submissionResponse = await axios.post(
        `${baseUrl}/api/v1/add-publication`,
        {
          name,
          issnNumber,
          authors: authorsJson,
          title,
          journalTitle,
          publicationDate,
          citationCount,
          pageNumbers,
          keywords: keywordsJson,
          paperLink,
          description,
        },
        config
      );

      toast.success("Publication added successfully!");
      clearForm();
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-main">
      <Navbar />
      <div className="form-container">
        <h2>Add Publication</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="issnNumber">ISSN Number:</label>
            <input
              id="issnNumber"
              type="text"
              value={issnNumber}
              onChange={(e) => setIssnNumber(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Authors:</label>
            {authors.map((author, index) => (
              <div key={index} className="author-input">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => handleAuthorChange(index, e.target.value)}
                  required
                />
                {authors.length > 1 && (
                  <button
                    type="button"
                    className="icon-button remove"
                    onClick={() => handleRemoveAuthor(index)}
                  >
                    <FaMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="icon-button add"
              onClick={handleAddAuthor}
            >
              <FaPlus /> Add Author
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="title">Title of the Article:</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="journalTitle">Title of the Journal:</label>
            <input
              id="journalTitle"
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="publicationDate">Date of Publication:</label>
            <input
              id="publicationDate"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="citationCount">Citation Count:</label>
            <input
              id="citationCount"
              type="text"
              value={citationCount}
              onChange={(e) => setCitationCount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pageNumbers">Page Numbers:</label>
            <input
              id="pageNumbers"
              type="text"
              value={pageNumbers}
              onChange={(e) => setPageNumbers(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Keywords:</label>
            {keywords.map((keyword, index) => (
              <div key={index} className="keyword-input">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  required
                />
                {keywords.length > 1 && (
                  <button
                    type="button"
                    className="icon-button remove"
                    onClick={() => handleRemoveKeyword(index)}
                  >
                    <FaMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="icon-button add"
              onClick={handleAddKeyword}
            >
              <FaPlus /> Add Keyword
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="paperLink">Link of the Paper:</label>
            <input
              id="paperLink"
              type="url"
              value={paperLink}
              onChange={(e) => setPaperLink(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          {message && <div className="message">{message}</div>}
          <div className="form-group">
            <button type="submit" className="submit-btn">
              {isLoading ? "Adding publication..." : "Add Publication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPublication;
