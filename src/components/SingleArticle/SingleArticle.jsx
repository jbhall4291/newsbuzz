import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getArticleById, voteOnArticle } from "../../utils/api";
import Comments from "../Comments/Comments";
import "./SingleArticle.css";
import { convertTimeAndDate } from "../../utils/functions";
import ActivityIndicator from "../ActivityIndicator/ActivityIndicator";
import { deleteArticle, getAllTopics } from "../../utils/api";

import { useNavigate } from "react-router-dom";

import React from "react";

const SingleArticle = (props) => {
  const navigate = useNavigate();

  const { article_id } = useParams();

  const [articleData, setArticleData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [votes, setVotes] = useState(0);
  const [isVotingError, setIsVotingError] = useState(false);

  const [removeArticleButtonText, setRemoveArticleButtonText] =
    useState("REMOVE ARTICLE");
  const [isRemovingArticle, setIsRemovingArticle] = useState(false);

  useEffect(() => {
    setErr(false);
    setIsLoading(true);
    getArticleById(article_id)
      .then((article) => {
        setArticleData(article);
        setVotes(article.votes);
        setIsLoading(false);
      })
      .catch((err) => {
        setErr(err.response.data.msg);
        setIsLoading(false);
      });
  }, [article_id]);

  const pluraliseComments = (comment_count) => {
    if (comment_count === 0) return `No comments`;
    else if (comment_count === 1) return `${comment_count} comment`;
    else {
      return `${comment_count} comments`;
    }
  };

  const updateVotes = (vote) => {
    if (localStorage.getItem(article_id)) {
      localStorage.removeItem(article_id, "userHasVoted");
      setIsVotingError(false);

      setVotes(votes - 1);

      voteOnArticle(article_id, { inc_votes: vote }).catch(() => {
        setIsVotingError(true);
        setVotes((currentVotes) => currentVotes + vote);
        localStorage.setItem(article_id, "userHasVoted");
      });
    } else {
      localStorage.setItem(article_id, "userHasVoted");
      setIsVotingError(false);

      setVotes((currentVotes) => currentVotes + vote);
      voteOnArticle(article_id, { inc_votes: vote }).catch(() => {
        setIsVotingError(true);
        setVotes((currentVotes) => currentVotes - vote);
        localStorage.removeItem(article_id, "userHasVoted");
      });
    }
  };

  const removeArticle = () => {
    setIsRemovingArticle(true);
    setRemoveArticleButtonText("REMOVING...");
    deleteArticle(article_id)
      .then(() => {
        setRemoveArticleButtonText("REMOVED!");
        navigate("/articles");
        getAllTopics().then((results) => {
          props.setAllTopics(results);
        });
      })
      .catch((error) => {
        setRemoveArticleButtonText(error.message + `\n (try again)`);
        setIsRemovingArticle(false);
      });
  };

  if (err) return <p>Article Not Found!</p>;

  return (
    <div>
      {isLoading ? (
        <>
          <p>loading article, please wait...</p>
          <ActivityIndicator />
        </>
      ) : (
        <section className="SingleArticle__section">
          <main>
            <img
              src={articleData.article_img_url}
              alt={articleData.title}
            ></img>
            <h3>{articleData.title}</h3>
            <h4>
              <em>by {articleData.author}</em>
            </h4>

            <h5>{articleData.body}</h5>

            <div className="SingleArticle__div--details_area">
              <div>
                <p>
                  <i className="fa-solid fa-clock"></i>{" "}
                  <span>{convertTimeAndDate(articleData.created_at)}</span>
                </p>
              </div>
              <div>
                <p>
                  <i className="fa-solid fa-thumbs-up"></i>{" "}
                  {isVotingError ? (
                    <span className="SingleArticle__span--error">
                      Error Voting!
                    </span>
                  ) : (
                    <span>{votes} votes</span>
                  )}
                </p>
              </div>
              <div>
                <p>
                  <i className="fa-solid fa-comment"></i>{" "}
                  {pluraliseComments(articleData.comment_count)}
                </p>
              </div>
            </div>
            <div>
              {localStorage.getItem(article_id) ? (
                <button
                  className="SingleArticle__button--voted-up SingleArticle__button--vote"
                  onClick={() => updateVotes(-1)}
                >
                  <i className="fa-solid fa-thumbs-up"></i>
                  <p>
                    <b>
                      REMOVE<br></br> UPVOTE
                    </b>
                  </p>
                </button>
              ) : (
                <button
                  className="SingleArticle__button--no-vote SingleArticle__button--vote"
                  onClick={() => updateVotes(1)}
                >
                  <i className="fa-solid fa-thumbs-up"></i>
                  <p>
                    <b>UPVOTE </b>
                  </p>
                </button>
              )}

              {props.loggedInUser === articleData.author ? (
                <button
                  className="SingleArticle__button--remove-article"
                  disabled={isRemovingArticle}
                  onClick={() => removeArticle()}
                >
                  <i className=""></i>
                  <p>
                    <b>{removeArticleButtonText}</b>
                  </p>
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </main>

          <Comments article_id={article_id} loggedInUser={props.loggedInUser} />
        </section>
      )}
    </div>
  );
};

export default SingleArticle;
