const axios = require("axios");
const { Publication } = require("../models/Publication");
const { Op } = require("sequelize");
const SCOPUS_API_KEY = process.env.SCOPUS_API_KEY;
const SCOPUS_INST_TOKEN = process.env.SCOPUS_INST_TOKEN;

async function fetchAndSavePublications(user, authorID) {
  let startIndex = 0;
  let totalResults = 1;
  while (startIndex < totalResults) {
    const searchUrl = `https://api.elsevier.com/content/search/scopus?query=AU-ID(${authorID})&start=${startIndex}&count=25`;
    try {
      console.log(`Making search request to: ${searchUrl}`);
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          "X-ELS-APIKey": SCOPUS_API_KEY,
          "X-ELS-Insttoken": SCOPUS_INST_TOKEN,
        },
      });
      console.log("Search API Response Status:", searchResponse.status);

      const searchData = searchResponse.data["search-results"];
      totalResults = parseInt(searchData["opensearch:totalResults"]);

      for (const entry of searchData.entry) {
        const publicationData = await fetchDetailedPublicationData(entry, user);
        console.log(
          "Publication Data:",
          JSON.stringify(publicationData, null, 2)
        );
        console.log(
          "Publication Model Methods:",
          Object.keys(Publication.prototype)
        );

        try {
          const [publication, created] = await Publication.findOrCreate({
            where: { eid: publicationData.eid },
            defaults: { ...publicationData, user_id: user.id },
          });

          if (!created) {
            await publication.update({ ...publicationData, user_id: user.id });
          }

          console.log(
            "Saved/Updated Publication:",
            JSON.stringify(publication, null, 2)
          );
        } catch (error) {
          console.error("Error updating/inserting publication:", error);
        }
      }
      startIndex += 25;
    } catch (error) {
      console.error("Error fetching publications:", error);
      console.error(
        "Error details:",
        error.response ? error.response.data : error.message
      );
      break;
    }
  }
}

async function fetchDetailedPublicationData(entry, user) {
  const fullEid = entry.eid;
  const eid = fullEid.split("-").pop();
  const baseUrl = "https://api.elsevier.com/content/abstract/scopus_id/";
  const headers = {
    "X-ELS-APIKey": SCOPUS_API_KEY,
    "X-ELS-Insttoken": SCOPUS_INST_TOKEN,
  };

  try {
    const basicDataUrl = `${baseUrl}${eid}?field=dc:description,eid`;
    const basicDataResponse = await axios.get(basicDataUrl, { headers });
    const basicData = basicDataResponse.data["abstracts-retrieval-response"];

    const authorDataUrl = `${baseUrl}${eid}?field=authors`;
    const authorDataResponse = await axios.get(authorDataUrl, { headers });
    const authorData = authorDataResponse.data["abstracts-retrieval-response"];

    const keywordDataUrl = `${baseUrl}${eid}?field=authkeywords`;
    const keywordDataResponse = await axios.get(keywordDataUrl, { headers });
    const keywordData =
      keywordDataResponse.data["abstracts-retrieval-response"];

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      issnNumber: entry["prism:issn"] || "",
      title: entry["dc:title"] || "",
      journalTitle: entry["prism:publicationName"] || "",
      publicationDate: entry["prism:coverDate"]
        ? new Date(entry["prism:coverDate"])
        : null,
      pageNumbers: entry["prism:pageRange"] || "",
      citationCount: entry["citedby-count"]
        ? parseInt(entry["citedby-count"])
        : 0,
      paperLink: `https://www.scopus.com/record/display.uri?eid=${fullEid}&origin=resultslist`,
      description: basicData?.coredata?.["dc:description"] || "",
      authors: JSON.stringify(parseAuthors(authorData?.authors?.author)),
      keywords: JSON.stringify(parseKeywords(keywordData?.authkeywords)),
      eid: fullEid,
    };
  } catch (error) {
    console.error(`Error fetching detailed data for EID ${eid}:`, error);
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      eid: fullEid,
    };
  }
}

function parseAuthors(authors) {
  if (!authors) return [];
  if (Array.isArray(authors)) {
    return authors.map((author) =>
      `${author["ce:given-name"] || ""} ${author["ce:surname"] || ""}`.trim()
    );
  } else if (typeof authors === "object") {
    return [
      `${authors["ce:given-name"] || ""} ${authors["ce:surname"] || ""}`.trim(),
    ];
  }
  return [];
}

function parseKeywords(authkeywords) {
  if (!authkeywords) return [];
  if (Array.isArray(authkeywords["author-keyword"])) {
    return authkeywords["author-keyword"].map(
      (keyword) => keyword["$"] || keyword
    );
  } else if (typeof authkeywords["author-keyword"] === "object") {
    return [authkeywords["author-keyword"]["$"] || ""];
  } else if (typeof authkeywords["author-keyword"] === "string") {
    return [authkeywords["author-keyword"]];
  }
  return [];
}

async function validateAuthorID(authorID) {
  const searchUrl = `https://api.elsevier.com/content/search/scopus?query=AU-ID(${authorID})&count=1`;
  try {
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        "X-ELS-APIKey": SCOPUS_API_KEY,
        "X-ELS-Insttoken": SCOPUS_INST_TOKEN,
      },
    });
    const searchData = searchResponse.data["search-results"];
    const totalResults = parseInt(searchData["opensearch:totalResults"]);
    return totalResults > 0;
  } catch (error) {
    console.error("Error validating Author ID:", error);
    return false;
  }
}

module.exports = { fetchAndSavePublications, validateAuthorID };
